
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split

project_root = Path(__file__).resolve().parents[2]

input_path = project_root / "data" / "raw" / "dataset.csv"
output_path = project_root / "data" / "processed" / "regional_brain_data.csv"

dataset = pd.read_csv(input_path)

predictor_columns = ["Age", "Sex", "ICV"]

brain_regions = [
    "Hippocampus",
    "Frontal_Lobe",
    "Temporal_Lobe",
    "Parietal_Lobe"
]

train_indices, test_indices = train_test_split(
    dataset.index,
    test_size=0.2,
    random_state=42
)

training_data = dataset.loc[train_indices]
testing_data = dataset.loc[test_indices].copy()

for region in brain_regions:
    preprocessing = ColumnTransformer(
        transformers=[
            ("numeric", StandardScaler(), ["Age", "ICV"]),
            ("categorical", OneHotEncoder(handle_unknown="ignore"), ["Sex"])
        ]
    )

    normative_pipeline = Pipeline([
        ("preprocessing", preprocessing),
        ("regression", LinearRegression())
    ])

    normative_pipeline.fit(
        training_data[predictor_columns],
        training_data[region]
    )

    expected_volume = normative_pipeline.predict(
        testing_data[predictor_columns]
    )

    training_predictions = normative_pipeline.predict(
        training_data[predictor_columns]
    )

    residuals = training_data[region].to_numpy() - training_predictions
    residual_standard_deviation = np.std(residuals, ddof=1)

    testing_data[f"{region}_Expected"] = expected_volume
    testing_data[f"{region}_Residual"] = (
        testing_data[region] - expected_volume
    )

    testing_data[f"{region}_ZScore"] = (
        testing_data[f"{region}_Residual"] / residual_standard_deviation
    )

testing_data["Abnormal_Regions_Count"] = (
    testing_data[[f"{region}_ZScore" for region in brain_regions]]
    .abs()
    .gt(2)
    .sum(axis=1)
)

output_path.parent.mkdir(parents=True, exist_ok=True)
testing_data.to_csv(output_path, index=False)

print("Normative modelling completed successfully.")
print(f"Reference subjects: {len(training_data)}")
print(f"Evaluated subjects: {len(testing_data)}")
print(f"Saved results to: {output_path}")

print("\nRegional Z-scores for the first five evaluated subjects:")
print(
    testing_data[
        ["Subject_ID"] + [f"{region}_ZScore" for region in brain_regions]
    ].head().round(3)
)