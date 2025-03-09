from fastapi import APIRouter, UploadFile, File
from app.services.plagiarism_service import check_plagiarism

router = APIRouter(prefix="/plagiarism", tags=["Plagiarism Checker"])

@router.post("/")
async def upload_files(file1: UploadFile = File(...), file2: UploadFile = File(...)):
    try:
        doc1_text = (await file1.read()).decode("utf-8")
        doc2_text = (await file2.read()).decode("utf-8")
        result = check_plagiarism(doc1_text, doc2_text)
        return {"file1": file1.filename, "file2": file2.filename, "plagiarism_result": result}
    except Exception as e:
        return {"error": str(e)}
