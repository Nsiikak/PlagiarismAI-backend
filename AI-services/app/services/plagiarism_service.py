from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def vectorize(text):
    return TfidfVectorizer().fit_transform(text).toarray()

def similarity(doc1, doc2):
    return cosine_similarity([doc1, doc2])[0][1]

def check_plagiarism(doc1_text, doc2_text):
    vectors = vectorize([doc1_text, doc2_text])
    sim_score = similarity(vectors[0], vectors[1])
    return {"similarity_score": round(sim_score, 4)}
