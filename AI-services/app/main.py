from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # Import CORSMiddleware
from app.routers.grading_router import router as grading_router
from app.routers.plagiarism_router import router as plagiarism_router

app = FastAPI(title="AI-Based Grading & Plagiarism System")

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://assessment-system-frontend.onrender.com/"],  # Allow only this origin
    allow_credentials=True,  # Allow cookies and credentials
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Include routers
app.include_router(grading_router)
app.include_router(plagiarism_router)

@app.get("/")
def root():
    return {"message": "Welcome to AI Grading & Plagiarism Detection System"}