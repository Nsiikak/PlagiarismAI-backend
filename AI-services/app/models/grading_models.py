from pydantic import BaseModel
from typing import Dict

class MCQSubmission(BaseModel):
    question: str
    correct_answer: str
    student_answer: str

class TextSubmission(BaseModel):
    question: str
    reference_answer: str
    student_answer: str

class EssaySubmission(BaseModel):
    student_answer: str

class CodeSubmission(BaseModel):
    student_code: str
    test_cases: Dict[str, str]  # {"input": expected_output}
