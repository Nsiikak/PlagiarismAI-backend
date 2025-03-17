from io import BytesIO
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from docx import Document
import fitz  # PyMuPDF

def extract_text_from_docx(file_bytes):
    """Extracts text from a .docx file given as bytes."""
    doc = Document(BytesIO(file_bytes))  # Load from memory
    return "\n".join([para.text for para in doc.paragraphs])

def extract_text_from_txt(file_bytes):
    """Extracts text from a .txt file given as bytes."""
    return file_bytes.decode("utf-8")  # Decode bytes to string

def extract_text_from_pdf(file_bytes):
    """Extracts text from a .pdf file given as bytes."""
    doc = fitz.open(stream=BytesIO(file_bytes), filetype="pdf")  # Read from bytes
    return "\n".join([page.get_text("text") for page in doc])

def get_text(file_bytes, filename):
    """Determines file type and extracts text accordingly."""
    if filename.endswith(".docx"):
        return extract_text_from_docx(file_bytes)
    elif filename.endswith(".txt"):
        return extract_text_from_txt(file_bytes)
    elif filename.endswith(".pdf"):
        return extract_text_from_pdf(file_bytes)
    else:
        raise ValueError("Unsupported file format. Use .txt, .docx, or .pdf")

def vectorize(texts):
    """Converts a list of texts into TF-IDF vectors."""
    return TfidfVectorizer().fit_transform(texts).toarray()

def similarity(doc1, doc2):
    """Calculates cosine similarity between two vectors."""
    return cosine_similarity([doc1, doc2])[0][1]

def check_plagiarism(file1_bytes, filename1, file2_bytes, filename2):
    """Reads two files and calculates their similarity as a percentage."""
    doc1_text = get_text(file1_bytes, filename1)
    doc2_text = get_text(file2_bytes, filename2)
    vectors = vectorize([doc1_text, doc2_text])
    sim_score = similarity(vectors[0], vectors[1]) * 100  # Convert to percentage
    return {"similarity_percentage": round(sim_score, 2)}
