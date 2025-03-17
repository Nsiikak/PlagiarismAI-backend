# **Plagiarism Detection API**

This is a **FastAPI**-based microservice for **detecting plagiarism** between two text documents using **TF-IDF vectorization** and **cosine similarity**.

---

## **Features**

✅ Upload two text files and compare them.  
✅ Calculate **cosine similarity** to detect plagiarism.  
✅ API response includes a **similarity score (0 to 1)**.  
✅ Built using **FastAPI** for high performance.

---

## **Installation**

### **1. Clone the Repository**

```bash
git clone https://github.com/Nsiikak/plagiarism-ai-service.git
cd plagiarism-ai-service
```

### **2. Create a Virtual Environment** (Recommended)

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### **3. Install Dependencies**

```bash
pip install -r requirements.txt
```

### **4. Run the FastAPI Server**

```bash
uvicorn app.main:app --reload
```

Server runs at: **`http://127.0.0.1:8000`**

---

## **API Endpoints**

### **1. Check Plagiarism**

**`POST /check-plagiarism/`**  
Upload two text files and get a plagiarism similarity score.

#### **Request (Form Data)**

| Parameter | Type | Description                |
| --------- | ---- | -------------------------- |
| `file1`   | File | First document to compare  |
| `file2`   | File | Second document to compare |

#### **Response Example**

```json
{
  "file1": "document1.txt",
  "file2": "document2.txt",
  "plagiarism_result": {
    "similarity_score": 0.85
  }
}
```

---

## **Project Structure**

```
plagiarism-ai-service/
│── app/
│   │── routers/
│   │   │── plagiarism.py  # API logic
│   │── services/
│   │   │── plagiarism_model.py  # AI model
│   │── models/
│   │   │── schemas.py  # Request/response models
│   │── main.py  # Entry point
│── requirements.txt
│── .env
│── Dockerfile
│── README.md
```

---

## **Future Enhancements**

- 🛠 **Improve AI model** with advanced NLP techniques.
- 🔍 **Check against multiple documents** for higher accuracy.
- 🚀 **Deploy with Docker & Kubernetes** for scalability.

---

## **Contributor**

👤 **Nsikak-Abasi Ebong**  
📧 **nsikakebong98@gmail.com**  
🔗 **[GitHub](https://github.com/Nsiikak)**

---

## **License**

📜 MIT License – Free to use and modify.
