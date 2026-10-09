
import pandas as pd
from pathlib import Path
from scipy.stats import pearsonr, spearmanr
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score

project_root = Path(__file__).resolve().parents[2]

input_path = project_root / "data" / "processed" / "regional_brain_data.csv"
output_path = project_root / "results" / "reports" / "cognitive_correlations.csv"

data = pd.read_csv(input_path)

brain_regions = [
    "Hippocampus",
    "Frontal_Lobe",
    "Temporal_Lobe",
    "Parietal_Lobe"
]

cognitive_scores = [
    "Memory_Score",
    "Executive_Score",
    "MMSE"
]

results = []

for region in brain_regions:
    for cognitive_score in cognitive_scores:
        for feature_type in ["Volume", "ZScore"]:
            feature = region if feature_type == "Volume" else f"{region}_ZScore"

            correlation_data = data[[feature, cognitive_score]].dropna()

            pearson_r, pearson_p = pearsonr(
                correlation_data[feature],
                correlation_data[cognitive_score]
            )

            spearman_r, spearman_p = spearmanr(
                correlation_data[feature],
                correlation_data[cognitive_score]
            )

            regression = LinearRegression()
            regression.fit(
                correlation_data[[feature]],
                correlation_data[cognitive_score]
            )

            predicted = regression.predict(
                correlation_data[[feature]]
            )

            results.append({
                "Brain_Region": region,
                "Feature_Type": feature_type,
                "Cognitive_Score": cognitive_score,
                "Pearson_Correlation": pearson_r,
                "Pearson_P_Value": pearson_p,
                "Spearman_Correlation": spearman_r,
                "Spearman_P_Value": spearman_p,
                "Regression_R2": r2_score(
                    correlation_data[cognitive_score], predicted
                )
            })

results_data = pd.DataFrame(results)
output_path.parent.mkdir(parents=True, exist_ok=True)
results_data.to_csv(output_path, index=False)

print("Cognitive relationship analysis completed.")
print(f"Results saved to: {output_path}")

print("\nStrongest absolute Pearson correlations:")
print(
    results_data.assign(
        Absolute_Correlation=results_data["Pearson_Correlation"].abs()
    )
    .sort_values("Absolute_Correlation", ascending=False)
    .head(10)[[
        "Brain_Region",
        "Feature_Type",
        "Cognitive_Score",
        "Pearson_Correlation",
        "Pearson_P_Value"
    ]]
    .round(4)
    .to_string(index=False)
)