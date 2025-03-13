import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Get roles required for this route (if any)
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    // If no roles required, just check if user is authenticated
    if (!requiredRoles) {
      return super.canActivate(context);
    }

    // Check authentication and roles
    return super.canActivate(context).then(async (isAuthenticated) => {
      if (!isAuthenticated) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      const request = context.switchToHttp().getRequest();
      const user = request.user;

      // Verify user has required role
      const hasRole = requiredRoles.includes(user.role);
      if (!hasRole) {
        throw new UnauthorizedException(
          `Access denied. Required roles: ${requiredRoles.join(', ')}`,
        );
      }

      return true;
    });
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw new UnauthorizedException(
        info?.message || 'User not authenticated',
      );
    }

    // Validate user type (must be either student or teacher)
    if (!['student', 'teacher'].includes(user.role)) {
      throw new UnauthorizedException('Invalid user role');
    }

    return user;
  }
}
