import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    console.log('🔍 process.env.JWT_SECRET:', process.env.JWT_SECRET); // Directly check env
    console.log(
      '🔍 configService.get(JWT_SECRET):',
      configService.get('JWT_SECRET'),
    ); // Check config
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
    console.log('🔑 JWT Secret:', configService.get<string>('JWT_SECRET'));
  }

  async validate(payload: any) {
    console.log('🔥 Validating JWT:', payload); // ✅ Add this log

    if (!payload || !payload.matricOrStaffId) {
      console.log('❌ Invalid token payload');
      throw new UnauthorizedException('Invalid token payload');
    }

    return {
      id: payload.sub,
      matricOrStaffId: payload.matricOrStaffId,
      role: payload.role,
    };
  }
}
