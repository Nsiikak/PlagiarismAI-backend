from fastapi import APIRouter, UploadFile, File
from app.services.plagiarism_service import check_plagiarism

router = APIRouter(prefix="/plagiarism", tags=["Plagiarism Checker"])

@router.post("/")
async def upload_files(file1: UploadFile = File(...), file2: UploadFile = File(...)):
    try:
        # Read files once and store in memory
        file1_content = await file1.read()
        file2_content = await file2.read()

        result = check_plagiarism(
            file1_content, file1.filename,
            file2_content, file2.filename
        )
        return {
            "file1": file1.filename,
            "file2": file2.filename,
            "plagiarism_result": result
        }
    except Exception as e:
        return {"error": str(e)}
