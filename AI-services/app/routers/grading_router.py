from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.grading_service import (
    grade_mcq,
    grade_short_answer,
    grade_essay,
    grade_code,
    grade_assignment
)
from app.models.grading_models import MCQSubmission, TextSubmission, EssaySubmission, CodeSubmission

router = APIRouter()

@router.post("/grade/mcq")
async def grade_mcq_endpoint(submission: MCQSubmission):
    return grade_mcq(submission.correct_answer, submission.student_answer)

@router.post("/grade/short-answer")
async def grade_short_answer_endpoint(submission: TextSubmission):
    return grade_short_answer(submission.reference_answer, submission.student_answer)

@router.post("/grade/essay")
async def grade_essay_endpoint(submission: EssaySubmission):
    return grade_essay(submission.student_answer)

@router.post("/grade/code")
async def grade_code_endpoint(submission: CodeSubmission):
    return grade_code(submission.student_code, submission.test_cases)

@router.post("/grade/assignment")
async def grade_assignment_endpoint(file: UploadFile = File(...), marking_guide: UploadFile = File(...)):
    try:
        student_text = (await file.read()).decode(errors="ignore")
        guide_text = (await marking_guide.read()).decode(errors="ignore")
        
        result = grade_assignment(student_text, guide_text)
        
        return {
            "student_file": file.filename,
            "marking_guide": marking_guide.filename,
            "grading_result": result
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
