
import pandas as pd
import numpy as np
from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

project_root = Path(__file__).resolve().parents[2]

input_path = project_root / "data" / "raw" / "dataset.csv"
results_path = project_root / "results" / "reports" / "prediction_results.csv"
predictions_path = project_root / "data" / "processed" / "cognitive_predictions.csv"

data = pd.read_csv(input_path)

feature_columns = [
    "Age",
    "Sex",
    "ICV",
    "Hippocampus",
    "Frontal_Lobe",
    "Temporal_Lobe",
    "Parietal_Lobe"
]

target_columns = [
    "Memory_Score",
    "Executive_Score",
    "MMSE"
]

train_data, test_data = train_test_split(
    data,
    test_size=0.2,
    random_state=42
)

numeric_columns = [
    "Age",
    "ICV",
    "Hippocampus",
    "Frontal_Lobe",
    "Temporal_Lobe",
    "Parietal_Lobe"
]

categorical_columns = ["Sex"]

preprocessor = ColumnTransformer([
    ("numeric", Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ]), numeric_columns),
    ("categorical", OneHotEncoder(handle_unknown="ignore"), categorical_columns)
])

model_types = {
    "Linear Regression": LinearRegression(),
    "Random Forest": RandomForestRegressor(
        n_estimators=200,
        random_state=42,
        min_samples_leaf=3
    )
}

results = []
prediction_rows = test_data[["Subject_ID"] + target_columns].copy()

for target in target_columns:
    for model_name, model in model_types.items():
        pipeline = Pipeline([
            ("preprocessor", preprocessor),
            ("model", model)
        ])

        pipeline.fit(train_data[feature_columns], train_data[target])

        predicted_scores = pipeline.predict(test_data[feature_columns])

        results.append({
            "Cognitive_Score": target,
            "Model": model_name,
            "MAE": mean_absolute_error(test_data[target], predicted_scores),
            "RMSE": np.sqrt(mean_squared_error(test_data[target], predicted_scores)),
            "R2": r2_score(test_data[target], predicted_scores)
        })

        if model_name == "Random Forest":
            prediction_rows[f"{target}_Predicted"] = predicted_scores

results_data = pd.DataFrame(results)

results_path.parent.mkdir(parents=True, exist_ok=True)
predictions_path.parent.mkdir(parents=True, exist_ok=True)

results_data.to_csv(results_path, index=False)
prediction_rows.to_csv(predictions_path, index=False)

print("Cognitive prediction completed.")
print(f"Metrics saved to: {results_path}")
print(f"Predictions saved to: {predictions_path}")

print("\nModel evaluation:")
print(results_data.round(4).to_string(index=False))