from fastapi import FastAPI
from app.routers.grading_router import router as grading_router
from app.routers.plagiarism_router import router as plagiarism_router

app = FastAPI(title="AI-Based Grading & Plagiarism System")

# Include routers
app.include_router(grading_router)
app.include_router(plagiarism_router)

@app.get("/")
def root():
    return {"message": "Welcome to AI Grading & Plagiarism Detection System"}
