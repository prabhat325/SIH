"""
SIH Tourism AI/ML Microservice - Main Application Entrypoint.

Provides unified REST APIs for:
- 10-Dimensional Vector Recommendation & Contextual Ranking
- Explainable AI (XAI) Feature Attribution
- Content-Based Item-to-Item Similarity
- Constraint-Aware AI Itinerary Planning & Geographic Routing
- ML Budget Estimation (GradientBoosting with Rule-Based Fallback)
- ML Crowd Forecasting & Climate Suitability
- User Feedback & Personalization Pipeline
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings
from app.ml.inference import get_all_model_evaluations, warm_up_ml_models
from app.routes.budget import router as budget_router
from app.routes.crowd import router as crowd_router
from app.routes.destinations import router as destinations_router
from app.routes.feedback import router as feedback_router
from app.routes.itinerary import router as itinerary_router
from app.routes.recommendations import router as recommendations_router
from app.routes.weather import router as weather_router
from app.services.destination_service import load_destinations
from app.services.feedback_service import init_feedback_db

app = FastAPI(
    title=settings.APP_NAME,
    description="""
# 🚀 Smart India Hackathon (SIH) Unified Tourism AI/ML Platform
High-performance AI/ML microservice delivering:
* **10-Dimensional Vector Preference Engine**: Mathematical Cosine Similarity matching across travel dimensions.
* **Context-Aware Ranking Pipeline**: Companion matching, seasonality windowing, budget alignment, and safety indexing.
* **Explainable AI (XAI)**: Feature contribution calculations, positive matching factors, and contextual warnings.
* **Item-to-Item Similarity**: Discovering vibe-matched alternative destinations across India.
* **Constraint-Aware AI Itinerary Generator**: Route-optimized (TSP) day-by-day schedules with regional cuisine and travel tips.
* **ML Travel Budget Regressor**: GradientBoosting model with itemized breakdown and confidence intervals.
* **ML Crowd & Climate Forecaster**: 12-month footfall prediction, weather diagnostics, and overtourism mitigation.
* **User Feedback & Personalization Pipeline**: Interaction logging and ML training dataset exporter.
    """,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Enable CORS for all origins for web & mobile clients (React, Next.js, Node.js, Flutter)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    """Initializes dataset cache, ML model warmup, and interaction database on server startup."""
    try:
        destinations = load_destinations()
        print(f"[STARTUP] Loaded {len(destinations)} destinations into memory cache.")
        init_feedback_db()
        print("[STARTUP] Initialized SQLite user feedback database.")
        metrics = warm_up_ml_models()
        print(f"[STARTUP] Trained and warmed up ML models: {metrics}")
    except Exception as e:
        print(f"[WARNING] Error during service startup initialization: {e}")


# Register API v1 Routers
API_V1_PREFIX = settings.API_V1_PREFIX
app.include_router(recommendations_router, prefix=API_V1_PREFIX)
app.include_router(itinerary_router, prefix=API_V1_PREFIX)
app.include_router(budget_router, prefix=API_V1_PREFIX)
app.include_router(crowd_router, prefix=API_V1_PREFIX)
app.include_router(weather_router, prefix=API_V1_PREFIX)
app.include_router(destinations_router, prefix=API_V1_PREFIX)
app.include_router(feedback_router, prefix=API_V1_PREFIX)


@app.get("/", tags=["System & Health"])
def root():
    return {
        "message": "SIH Tourism AI/ML Service is active & ready.",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "endpoints": {
            "recommendations": f"{API_V1_PREFIX}/recommend",
            "similar_places": f"{API_V1_PREFIX}/recommend/similar",
            "itinerary_generator": f"{API_V1_PREFIX}/itinerary/generate",
            "budget_estimator": f"{API_V1_PREFIX}/budget/estimate",
            "budget_predict_ml": f"{API_V1_PREFIX}/budget/predict",
            "crowd_forecast": f"{API_V1_PREFIX}/crowd/forecast",
            "weather_suitability": f"{API_V1_PREFIX}/weather/{{destination_id}}",
            "destinations_catalog": f"{API_V1_PREFIX}/destinations",
            "feedback_logger": f"{API_V1_PREFIX}/feedback",
            "ml_evaluation_metrics": f"{API_V1_PREFIX}/ml/metrics",
        },
        "status": "online",
    }


@app.get("/health", tags=["System & Health"])
def health():
    all_destinations = load_destinations()
    return {
        "status": "healthy",
        "cached_destinations": len(all_destinations),
        "version": settings.APP_VERSION,
    }


@app.get("/api/v1/ml/metrics", tags=["Machine Learning Metrics & Evaluation"])
def get_ml_metrics():
    """Returns genuine evaluation metrics (MAE, RMSE, R²) for all trained ML models."""
    return {
        "status": "success",
        "evaluations": get_all_model_evaluations(),
    }