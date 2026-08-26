# 🚀 Smart Tourism AI/ML Platform & Microservice

An intelligent, high-performance AI/ML microservice built with **FastAPI**, **Scikit-learn**, and **Pydantic**. Engineered for next-generation travel personalization, multi-constraint itinerary planning, ML-based dynamic budget estimation, crowd forecasting, and explainable AI recommendations.

---

## 🌟 Key Features

### 1. 🎯 10-Dimensional Vector Preference Engine
- Calculates mathematical **Cosine Similarity** between user preference profiles and multi-dimensional destination feature vectors:
  - *Nature, History, Adventure, Food, Beach, Culture, Relaxation, Wildlife, Spirituality, Nightlife*

### 2. 🧠 Context-Aware Multi-Factor Ranking
- Adjusts baseline similarity scores with dynamic contextual signals:
  - **Companion Matching**: Calibrated affinity scoring for *Solo, Couple, Family, Friends*
  - **Seasonal Windowing**: Peak vs. off-peak travel month detection and surge adjustments
  - **Budget Tier Constraints**: Proximity bonuses and tiered mismatch penalties
  - **Quality & Safety Indexing**: Composite rating and safety scores

### 3. 🔍 Explainable AI (XAI) Feature Attribution
- Transparent recommendation diagnostics breaking down:
  - Percentage feature contributions to the final match score
  - Positive matching factors (e.g., strong alignment in *Heritage* or *Adventure*)
  - Real-time contextual warnings (e.g., heavy monsoon season or budget misalignment)

### 4. 🔄 Item-to-Item Destination Similarity
- Content-based collaborative recommendation discovering "vibe-matched" alternative destinations across India using feature distances and category clustering.

### 5. 🗺️ Constraint-Aware AI Itinerary Generator
- Multi-day, route-optimized itinerary synthesis using Travelling Salesperson Problem (TSP) heuristics and Haversine distance calculations.
- Integrated regional cuisine suggestions and localized travel tips.

### 6. 💰 ML Travel Budget Estimation
- Machine Learning regression (`GradientBoostingRegressor`) with rule-based fallback logic.
- Generates itemized expense breakdowns (*Accommodation, Food, Transit, Activities, Contingency*) with group economy scaling.

### 7. 👥 ML Crowd & Climate Forecaster
- 12-month footfall forecasting, weather comfort diagnostics, and overtourism mitigation metrics.

### 8. 📊 Feedback & Continuous Learning Pipeline
- Persistent interaction logging (SQLite) with feedback rating ingestion and ML training dataset export.

---

## 📂 Project Structure

```
AI-ML/
├── app/
│   ├── config/
│   │   └── settings.py              # Centralized configuration & hyperparameter constants
│   ├── ml/
│   │   ├── budget_model.py          # ML budget regression models
│   │   ├── crowd_model.py           # ML crowd forecasting models
│   │   ├── features.py              # Feature engineering & normalization
│   │   ├── inference.py             # Inference pipeline & model warmup
│   │   └── recommendation_model.py  # Model evaluation utilities
│   ├── models/                      # Pydantic schemas (Request/Response validation)
│   │   ├── budget.py
│   │   ├── crowd.py
│   │   ├── destination.py
│   │   ├── feedback.py
│   │   ├── itinerary.py
│   │   ├── recommendation.py
│   │   └── weather.py
│   ├── routes/                      # FastAPI endpoint routers
│   │   ├── budget.py
│   │   ├── crowd.py
│   │   ├── destinations.py
│   │   ├── feedback.py
│   │   ├── itinerary.py
│   │   ├── recommendations.py
│   │   └── weather.py
│   ├── services/                    # Business logic & algorithms
│   │   ├── budget_service.py
│   │   ├── contextual_ranker.py
│   │   ├── crowd_service.py
│   │   ├── destination_service.py
│   │   ├── feedback_service.py
│   │   ├── itinerary_service.py
│   │   ├── recommender.py
│   │   ├── routing.py
│   │   ├── similarity.py
│   │   ├── weather_service.py
│   │   └── xai.py
│   ├── utils/
│   │   ├── geo.py                   # Haversine distance & TSP heuristics
│   │   └── vector_ops.py            # Cosine similarity & vector normalization
│   ├── generate_dataset.py          # Dataset generator script
│   └── main.py                      # FastAPI application entry point
├── data/
│   └── destinations.csv             # Destination feature dataset
├── .gitignore
├── requirements.txt
└── README.md
```

---

## 🛠️ Quick Start & Installation

### 1. Prerequisites
- Python 3.10+
- `pip` or `uv`

### 2. Clone the Repository
```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd AI-ML
```

### 3. Create & Activate Virtual Environment
```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# Linux / macOS
python3 -m venv .venv
source .venv/bin/activate
```

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

### 5. Run the Server
```bash
uvicorn app.main:app --reload --port 8000
```

The server will be available at `http://127.0.0.1:8000`.

---

## 📖 Interactive API Documentation

Once the server is running, explore and test the interactive API documentation:
- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## 🧪 Testing

Run automated tests to verify services, math logic, and API endpoints:
```bash
python -m app.test_all_services
python -m app.verify_all_math_and_logic
python -m app.test_api_endpoints
```

---

## 📄 License
This project is licensed under the MIT License.
