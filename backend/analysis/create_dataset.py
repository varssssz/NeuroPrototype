
import numpy as np
import pandas as pd
from pathlib import Path

np.random.seed(42)

number_of_subjects = 500

age = np.random.randint(50, 86, number_of_subjects)
sex = np.random.choice(["Male", "Female"], number_of_subjects)
icv = np.random.normal(1450, 150, number_of_subjects)
icv = np.clip(icv, 1000, 1900)

age_effect = age - 50

hippocampus = (
    7500
    - 35 * age_effect
    + 1.5 * (icv - 1450)
    + np.random.normal(0, 300, number_of_subjects)
)

frontal_lobe = (
    180000
    - 350 * age_effect
    + 12 * (icv - 1450)
    + np.random.normal(0, 5000, number_of_subjects)
)

temporal_lobe = (
    150000
    - 300 * age_effect
    + 10 * (icv - 1450)
    + np.random.normal(0, 4500, number_of_subjects)
)

parietal_lobe = (
    170000
    - 250 * age_effect
    + 11 * (icv - 1450)
    + np.random.normal(0, 4500, number_of_subjects)
)

memory_score = (
    90
    - 0.45 * age_effect
    + 0.002 * (hippocampus - 6500)
    + np.random.normal(0, 5, number_of_subjects)
)

executive_score = (
    90
    - 0.35 * age_effect
    + 0.00008 * (frontal_lobe - 165000)
    + np.random.normal(0, 5, number_of_subjects)
)

mmse = (
    29
    - 0.04 * age_effect
    + 0.0004 * (hippocampus - 6500)
    + np.random.normal(0, 1.5, number_of_subjects)
)

memory_score = np.clip(memory_score, 0, 100)
executive_score = np.clip(executive_score, 0, 100)
mmse = np.clip(mmse, 0, 30)

dataset = pd.DataFrame({
    "Subject_ID": [f"S{i:04d}" for i in range(1, number_of_subjects + 1)],
    "Age": age,
    "Sex": sex,
    "ICV": np.round(icv, 2),
    "Hippocampus": np.round(hippocampus, 2),
    "Frontal_Lobe": np.round(frontal_lobe, 2),
    "Temporal_Lobe": np.round(temporal_lobe, 2),
    "Parietal_Lobe": np.round(parietal_lobe, 2),
    "MMSE": np.round(mmse, 2),
    "Memory_Score": np.round(memory_score, 2),
    "Executive_Score": np.round(executive_score, 2)
})

output_path = Path(__file__).resolve().parents[2] / "data" / "raw" / "dataset.csv"
output_path.parent.mkdir(parents=True, exist_ok=True)
dataset.to_csv(output_path, index=False)

print(f"Dataset created successfully: {output_path}")
print(f"Number of subjects: {len(dataset)}")
print("\nFirst five rows:")
print(dataset.head())
print("\nDataset shape:", dataset.shape)