from sentence_transformers import SentenceTransformer, util
import torch
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np


# Load Pre-trained Model
model = SentenceTransformer("all-MiniLM-L6-v2")

def grade_mcq(correct_answer, student_answer):
    correct = correct_answer.strip().lower()
    student = student_answer.strip().lower()
    score = 1 if correct == student else 0
    feedback = "Correct" if score == 1 else "Incorrect. Review the concepts."
    return {"score": score, "feedback": feedback}

def grade_short_answer(reference_answer, student_answer):
    ref_embedding = model.encode(reference_answer, convert_to_tensor=True)
    student_embedding = model.encode(student_answer, convert_to_tensor=True)
    similarity_score = util.pytorch_cos_sim(ref_embedding, student_embedding).item()
    score = round(similarity_score * 10, 2)
    feedback = "Good answer!" if score > 7 else "Consider improving your response."
    return {"score": score, "feedback": feedback}

def grade_essay(student_answer):
    essay_embedding = model.encode(student_answer, convert_to_tensor=True)
    coherence_score = util.pytorch_cos_sim(essay_embedding, essay_embedding).item() * 10
    final_score = round(coherence_score, 2)
    feedback = "Well-written" if final_score > 7 else "Needs improvement."
    return {"score": final_score, "feedback": feedback}

def grade_code(student_code, test_cases):
    local_namespace = {}  # Restrict execution to avoid polluting global scope
    try:
        exec(student_code, {}, local_namespace)  # Execute student code in an isolated namespace

        # Extract function name dynamically
        student_func = None
        for key, value in local_namespace.items():
            if callable(value):  # Ensure it's a function
                student_func = value
                break

        if student_func is None:
            return {"score": 0, "feedback": "No function found in the submitted code."}

        # Run test cases
        passed = 0
        for inp, expected in test_cases.items():
            try:
                args = eval(inp) if isinstance(inp, str) else inp  # Convert string input to tuple
                output = student_func(*args)  # Call extracted function
                if str(output) == str(expected):  # Ensure correct comparison
                    passed += 1
            except Exception as e:
                return {"score": 0, "feedback": f"Runtime error: {str(e)}"}

        # Compute score
        score = (passed / len(test_cases)) * 10
        feedback = "Correct implementation" if passed == len(test_cases) else f"Some test cases failed. Passed {passed}/{len(test_cases)}"

    except Exception as e:
        score = 0
        feedback = f"Code error: {str(e)}"

    return {"score": score, "feedback": feedback}

def jaccard_similarity(text1, text2):
    """Calculate Jaccard Similarity between two texts."""
    set1 = set(text1.lower().split())
    set2 = set(text2.lower().split())
    return len(set1 & set2) / len(set1 | set2)

def weighted_similarity(student_text, marking_guide):
    """Compute a weighted similarity score using multiple metrics."""
    # Encode using Sentence Transformer for semantic meaning
    student_embedding = model.encode(student_text, convert_to_tensor=True)
    guide_embedding = model.encode(marking_guide, convert_to_tensor=True)

    # Cosine Similarity (Semantic)
    cosine_sim = util.pytorch_cos_sim(student_embedding, guide_embedding).item()

    # Jaccard Similarity (Lexical Overlap)
    jaccard_sim = jaccard_similarity(student_text, marking_guide)

    # Weighted score (70% Semantic, 30% Jaccard)
    final_score = (cosine_sim * 0.7) + (jaccard_sim * 0.3)
    return round(final_score * 100, 2)

def extract_important_sentences(text, top_n=3):
    sentences = text.split(". ")
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(sentences)
    top_indices = np.array(tfidf_matrix.sum(axis=1)).flatten().argsort()[-top_n:][::-1]
    return " ".join(sentences[i] for i in top_indices)


def grade_assignment(student_text, marking_guide):
    """Grades an assignment based on similarity with a marking guide."""
    # Extract key content before comparison
    important_student_text = extract_important_sentences(student_text)
    important_marking_guide = extract_important_sentences(marking_guide)

    # Compute similarity
    similarity_score = weighted_similarity(important_student_text, important_marking_guide)

    # Grading Scale
    if similarity_score >= 80:
        grade = "A"
    elif similarity_score >= 60:
        grade = "B"
    elif similarity_score >= 50:
        grade = "C"
    elif similarity_score >= 40:
        grade = "D"
    else:
        grade = "F"

    return {
        "similarity_percentage": similarity_score,
        "grade": grade,
    }
