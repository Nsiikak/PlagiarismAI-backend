from sentence_transformers import SentenceTransformer, util
import torch

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


def grade_assignment(student_text, marking_guide):
    student_embedding = model.encode(student_text, convert_to_tensor=True)
    guide_embedding = model.encode(marking_guide, convert_to_tensor=True)
    similarity_score = util.pytorch_cos_sim(student_embedding, guide_embedding).item()
    final_score = round(similarity_score * 100, 2)

    if final_score >= 80:
        grade = "A"
    elif final_score >= 60:
        grade = "B"
    elif final_score >= 50:
        grade = "C"
    elif final_score >= 40:
        grade = "D"
    else:
        grade = "F"

    return {"similarity_score": final_score, "grade": grade}
