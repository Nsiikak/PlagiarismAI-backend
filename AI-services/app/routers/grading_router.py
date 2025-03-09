from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.grading_service import (
    grade_mcq,
    grade_short_answer,
    grade_essay,
    grade_code,
    grade_assignment
)

router = APIRouter()

@router.post("/grade/mcq")
async def grade_mcq_endpoint(correct_answer: str, student_answer: str):
    return grade_mcq(correct_answer, student_answer)

@router.post("/grade/short-answer")
async def grade_short_answer_endpoint(reference_answer: str, student_answer: str):
    return grade_short_answer(reference_answer, student_answer)

@router.post("/grade/essay")
async def grade_essay_endpoint(student_answer: str):
    return grade_essay(student_answer)

@router.post("/grade/code")
async def grade_code_endpoint(student_code: str, test_cases: dict):
    return grade_code(student_code, test_cases)

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