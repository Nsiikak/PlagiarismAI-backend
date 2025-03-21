# **Plagiarism Detection API**  

This project is structured into two major components:  

- **`backend/`** → Handles authentication, user management, and general API logic.  
- **`AI-services/`** → Contains the plagiarism detection microservice built with **FastAPI**.  

---

## **Features**  

✅ User authentication (Register/Login/Profile).  
✅ Class and assignment management.  
✅ Plagiarism detection API using **TF-IDF & Cosine Similarity**.  
✅ API response includes a **similarity score (0 to 1)**.  

---

## **Installation**  

### **1. Clone the Repository**  

```bash
git clone https://github.com/Nsiikak/plagiarism-ai-service.git
cd AI-services
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

## **Frontend API Endpoints**  

### **Authentication**  

| Method | Endpoint                 | Description |
|--------|--------------------------|-------------|
| POST   | `/api/v1/auth/register`   | Register a new user |
| POST   | `/api/v1/auth/login`      | User login |
| POST   | `/api/v1/auth/profile`    | Get user profile |

### **User Management**  

| Method | Endpoint                 | Description |
|--------|--------------------------|-------------|
| GET    | `/api/v1/users`          | Get all users |
| GET    | `/api/v1/users/:id`      | Get user by ID |
| DELETE | `/api/v1/users/:id`      | Delete user |

### **Class Management**  

| Method | Endpoint                               | Description |
|--------|----------------------------------------|-------------|
| POST   | `/api/v1/classes/create`              | Create a new class |
| POST   | `/api/v1/classes/join`                | Join a class |
| GET    | `/api/v1/classes/my-classes`          | Get classes for logged-in user |
| GET    | `/api/v1/classes/:id/students`        | Get students in a class |
| DELETE | `/api/v1/classes/:id`                 | Delete a class |
| POST   | `/api/v1/classes/:id/deactivate`      | Deactivate a class |
| POST   | `/api/v1/classes/:id/remove-student/:studentId` | Remove student from class |

### **Assignments & Plagiarism Detection**  

| Method | Endpoint                                    | Description |
|--------|--------------------------------------------|-------------|
| POST   | `/api/v1/assignments/create`              | Create a new assignment |
| POST   | `/api/v1/assignments/:id/submit`         | Submit an assignment |
| POST   | `/api/v1/assignments/:id/grade`          | Grade an assignment |
| POST   | `/api/v1/assignments/:id/check-plagiarism` | Check for plagiarism |
| GET    | `/api/v1/assignments/:id/submissions`    | Get all submissions for an assignment |

### **Plagiarism Detection API (AI-Services)**  

| Method | Endpoint                | Description |
|--------|-------------------------|-------------|
| POST   | `/check-plagiarism/`    | Compare two text files for plagiarism |

**Request (Form Data):**  

| Parameter | Type  | Description |
|-----------|------|-------------|
| `file1`   | File | First document |
| `file2`   | File | Second document |

**Response Example:**  

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
│── backend/                 # NestJS API
│   │── src/
│   │   │── controllers/
│   │   │── services/
│   │   │── models/
│── AI-services/             # FastAPI plagiarism detection
│   │── routers/
│   │── services/
│   │── models/
│   │── main.py
│── requirements.txt
│── .env
│── Dockerfile
│── README.md
```  

---

## **Future Enhancements**  

- 🛠 **Enhance AI model** for better accuracy.  
- 🔍 **Check against multiple documents** for better comparisons.  
- 🚀 **Deploy using Docker & Kubernetes** for scalability.  

---

## **Contributor**  

👤 **Nsikak-Abasi Ebong**  
📧 **nsikakebong98@gmail.com**  
🔗 **[GitHub](https://github.com/Nsiikak)**  

---

## **License**  

📜 MIT License – Free to use and modify.  
