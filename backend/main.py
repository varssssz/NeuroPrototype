
from pathlib import Path

import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

PROJECT_ROOT = Path(__file__).resolve().parents[1]

PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"
REPORTS_DIR = PROJECT_ROOT / "results" / "reports"

app = FastAPI(
    title="NeuroPrototype API",
    description="MRI regional analysis and cognitive score research prototype",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


def load_csv(path: Path) -> pd.DataFrame:
    if not path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Required file not found: {path.name}"
        )
    return pd.read_csv(path)


@app.get("/")
def home():
    return {
        "project": "MRI-Based Regional Brain Abnormality and Cognitive Function Analysis",
        "status": "running",
        "data_type": "synthetic prototype data",
        "docs": "/docs"
    }


@app.get("/api/summary")
def get_summary():
    data = load_csv(PROCESSED_DIR / "regional_brain_data.csv")
    metrics = load_csv(REPORTS_DIR / "prediction_results.csv")
    correlations = load_csv(REPORTS_DIR / "cognitive_correlations.csv")

    return {
        "subjects_analyzed": int(len(data)),
        "regions_analyzed": 4,
        "regions": [
            "Hippocampus",
            "Frontal Lobe",
            "Temporal Lobe",
            "Parietal Lobe"
        ],
        "average_absolute_z_score": round(
            float(data[
                [
                    "Hippocampus_ZScore",
                    "Frontal_Lobe_ZScore",
                    "Temporal_Lobe_ZScore",
                    "Parietal_Lobe_ZScore"
                ]
            ].abs().to_numpy().mean()),
            3
        ),
        "strongest_correlation": correlations.loc[
            correlations["Pearson_Correlation"].abs().idxmax(),
            [
                "Brain_Region",
                "Feature_Type",
                "Cognitive_Score",
                "Pearson_Correlation"
            ]
        ].to_dict(),
        "best_model_by_score": metrics.loc[
            metrics.groupby("Cognitive_Score")["R2"].idxmax(),
            ["Cognitive_Score", "Model", "MAE", "RMSE", "R2"]
        ].to_dict(orient="records"),
        "data_notice": "All results are based on synthetic data and are not clinical findings."
    }


@app.get("/api/subjects")
def get_subjects():
    data = load_csv(PROCESSED_DIR / "regional_brain_data.csv")

    return data.to_dict(orient="records")


@app.get("/api/subjects/{subject_id}")
def get_subject(subject_id: str):
    data = load_csv(PROCESSED_DIR / "regional_brain_data.csv")
    subject = data.loc[data["Subject_ID"] == subject_id]

    if subject.empty:
        raise HTTPException(status_code=404, detail="Subject not found")

    return subject.iloc[0].to_dict()


@app.get("/api/correlations")
def get_correlations():
    data = load_csv(REPORTS_DIR / "cognitive_correlations.csv")
    return data.to_dict(orient="records")


@app.get("/api/predictions")
def get_predictions():
    data = load_csv(REPORTS_DIR / "prediction_results.csv")
    return data.to_dict(orient="records")


@app.get("/api/predictions/subjects")
def get_subject_predictions():
    data = load_csv(PROCESSED_DIR / "cognitive_predictions.csv")
    return data.to_dict(orient="records")