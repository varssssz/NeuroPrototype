# System Architecture

## MRI-Based Regional Brain Abnormality and Cognitive Function Analysis

This document describes the architecture and data flow of the prototype.

---

# 1. High-Level Architecture

```text
                         ┌─────────────────────────┐
                         │       MRI DATASET       │
                         │      ADNI / OASIS       │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │   REGIONAL BRAIN DATA   │
                         │                         │
                         │ • Hippocampus           │
                         │ • Entorhinal            │
                         │ • Frontal               │
                         │ • Temporal              │
                         │ • Parietal              │
                         │ • Whole Brain           │
                         │ • Ventricles            │
                         │ • ICV                   │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │   SUBJECT INFORMATION   │
                         │                         │
                         │ • Age                   │
                         │ • Sex                   │
                         │ • ICV                   │
                         │ • Cognitive Scores      │
                         └────────────┬────────────┘
                                      │
                                      ▼
                  ┌─────────────────────────────────────┐
                  │       NORMATIVE MODELLING           │
                  │                                     │
                  │ Expected Volume =                   │
                  │ f(Age, Sex, ICV)                    │
                  └──────────────────┬──────────────────┘
                                     │
                                     ▼
                         ┌─────────────────────────┐
                         │       Z-SCORE           │
                         │                         │
                         │ Observed - Expected     │
                         │ ─────────────────       │
                         │   Residual SD           │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         REGIONAL ABNORMALITY
                                      │
                    ┌─────────────────┴─────────────────┐
                    │                                   │
                    ▼                                   ▼
          ┌──────────────────┐                ┌──────────────────┐
          │ STRUCTURAL       │                │ COGNITIVE        │
          │ ANALYSIS         │                │ ANALYSIS         │
          │                  │                │                  │
          │ • Region ranking │                │ • Memory         │
          │ • Z-score        │                │ • Executive      │
          │ • Deviation      │                │   Function       │
          └────────┬─────────┘                └────────┬─────────┘
                   │                                   │
                   └────────────────┬──────────────────┘
                                    ▼
                         ┌─────────────────────────┐
                         │ STATISTICAL ANALYSIS    │
                         │                         │
                         │ • Pearson/Spearman     │
                         │ • Correlation           │
                         │ • Linear Regression     │
                         │ • Effect Size           │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │    ML PREDICTION        │
                         │                         │
                         │ • Linear Regression     │
                         │ • Random Forest         │
                         │ • Gradient Boosting     │
                         │                         │
                         │ Predict Cognitive      │
                         │ Scores                  │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │      WEB DASHBOARD      │
                         │                         │
                         │ • Brain visualization   │
                         │ • Regional Z-scores     │
                         │ • Volume comparison     │
                         │ • Cognitive graphs      │
                         │ • Correlations          │
                         │ • ML predictions        │
                         │ • MAE / RMSE / R²       │
                         └─────────────────────────┘
```

---

# 2. Data Flow

The prototype follows the following processing pipeline:

```text
MRI / MRI-derived Dataset
          │
          ▼
    Load Subject Data
          │
          ▼
   Data Validation
          │
          ▼
 Regional Brain Volumes
          │
          ▼
 Normative Modelling
          │
          ├── Age
          ├── Sex
          └── ICV
          │
          ▼
 Expected Regional Volume
          │
          ▼
 Calculate Z-Score
          │
          ▼
 Regional Abnormality Profile
          │
     ┌────┴────┐
     ▼         ▼
  Memory    Executive
  Analysis  Function
     │         │
     └────┬────┘
          ▼
 Statistical Analysis
          │
          ▼
 Machine Learning
          │
          ▼
 Prediction & Evaluation
          │
          ▼
 Interactive Dashboard
```

---

# 3. Input Layer

The system uses an established neuroimaging dataset such as ADNI or OASIS.

For the prototype, MRI-derived regional measurements can be used instead of implementing MRI segmentation from scratch.

### Example Input Features

```text
Subject_ID
Age
Sex
ICV
Hippocampus
Entorhinal
Frontal
Temporal
Parietal
Whole_Brain
Ventricles
Memory_Score
Executive_Score
```

---

# 4. Regional Brain Analysis

The system analyzes structural measurements from multiple brain regions.

Important regions include:

| Region                       | Primary Cognitive Association |
| ---------------------------- | ----------------------------- |
| Hippocampus                  | Memory                        |
| Entorhinal / Medial Temporal | Memory                        |
| Frontal                      | Executive Function            |
| Temporal                     | Memory / Cognitive Processing |
| Parietal                     | Cognitive Processing          |
| Whole Brain                  | Global Structural Context     |
| Ventricles                   | Structural Change             |
| ICV                          | Head-size normalization       |

The regional measurements are used to create an individualized structural profile.

---

# 5. Normative Modelling

Raw regional brain volume cannot be interpreted independently because brain structure naturally varies between individuals.

The prototype therefore estimates the expected volume of each region using demographic and anatomical variables.

### Expected Volume

```text
Expected Volume =
β₀ + β₁(Age) + β₂(Sex) + β₃(ICV)
```

The model is trained using an appropriate reference/control population.

The observed regional volume is then compared with the predicted expected volume.

---

# 6. Regional Z-Score Calculation

The difference between observed and expected volume is represented as a standardized abnormality score.

### Residual

```text
Residual =
Observed Volume − Expected Volume
```

### Z-Score

```text
Z =
(Observed Volume − Expected Volume)
─────────────────────────────────
       Residual Standard Deviation
```

### Interpretation

```text
Z ≈ 0
→ Close to expected

Z < 0
→ Below expected

Z > 0
→ Above expected
```

For example:

```text
Hippocampus Z-score = -2.1
```

means the observed hippocampal volume is approximately 2.1 residual standard deviations below the expected value.

---

# 7. Structural Abnormality Profile

The Z-scores from different regions are combined to create an individualized structural profile.

Example:

```text
Subject: Example_001

Hippocampus       -2.10 Z
Entorhinal        -1.65 Z
Frontal           -0.82 Z
Temporal          -1.24 Z
Parietal          -0.45 Z
```

The system can rank regions according to the magnitude of their deviation from expected values.

---

# 8. Cognitive Function Analysis

The regional abnormality scores are compared with standardized cognitive measurements.

### Primary relationships

```text
Hippocampal Z-score
        ↓
   Memory Score
```

```text
Frontal Z-score
        ↓
Executive Function Score
```

The purpose is to determine whether greater structural abnormalities are statistically associated with poorer cognitive performance.

---

# 9. Statistical Analysis

The prototype can use:

### Correlation

Pearson or Spearman correlation can be used to measure the relationship between regional abnormality and cognitive scores.

Example:

```text
Hippocampus Z-score
        ↕
Memory Score

r = correlation coefficient
```

### Regression

Multiple linear regression can be used to examine relationships while accounting for relevant variables such as:

```text
Age
Sex
ICV
Education
Global Brain Volume
```

The output can include:

* Regression coefficients
* Confidence intervals
* Statistical significance
* Variance explained
* Effect sizes

Results are interpreted as associations rather than proof of causation.

---

# 10. Machine Learning Layer

Machine learning provides a secondary predictive analysis.

### Input Features

```text
Age
Sex
ICV
Hippocampus Z-score
Entorhinal Z-score
Frontal Z-score
Temporal Z-score
Parietal Z-score
```

### Target

```text
Memory Score
```

or

```text
Executive Function Score
```

### Prototype Models

```text
Linear Regression
Random Forest Regression
Gradient Boosting
```

---

# 11. Model Evaluation

The predictive models are evaluated using:

```text
MAE
RMSE
R²
Predicted vs Actual Correlation
```

### Feature Comparison

The prototype can compare different feature sets:

```text
Demographics
      ↓
Raw Regional Volumes
      ↓
Normalized Regional Z-Scores
      ↓
Z-Scores + Demographics
```

This allows the system to investigate whether normalized regional abnormalities provide additional predictive information compared with raw measurements.

---

# 12. Frontend Architecture

The frontend presents the analytical results through an interactive dashboard.

```text
                    WEB APPLICATION
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
   Overview          Subject Analysis   Brain Analysis
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
       Cognitive Analysis       ML Prediction
              │                       │
              └───────────┬───────────┘
                          ▼
                  Results Dashboard
```

---

# 13. Dashboard Components

### Overview

Displays:

* Dataset information
* Number of subjects
* Regional analysis summary
* Cognitive analysis summary

### Subject Analysis

Displays:

* Subject information
* Age
* Sex
* ICV
* Regional measurements
* Regional Z-scores

### Brain Analysis

Displays:

* Brain-region visualization
* Regional abnormality ranking
* Observed vs expected volume
* Selected-region details

### Cognitive Analysis

Displays:

* Memory relationships
* Executive-function relationships
* Correlation plots
* Regression results

### Prediction

Displays:

* Predicted cognitive score
* Actual cognitive score
* Model performance
* MAE
* RMSE
* R²

---

# 14. Prototype Repository Structure

```text
MRI-Cognitive-Analysis/
│
├── README.md
├── ARCHITECTURE.md
├── requirements.txt
│
├── data/
│   ├── raw/
│   │   └── dataset.csv
│   │
│   └── processed/
│       └── regional_brain_data.csv
│
├── backend/
│   ├── main.py
│   │
│   ├── analysis/
│   │   ├── preprocessing.py
│   │   ├── normative_model.py
│   │   ├── zscore.py
│   │   ├── statistics.py
│   │   └── prediction.py
│   │
│   └── models/
│
├── frontend/
│   ├── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── BrainVisualization.jsx
│   │   │   ├── RegionalAnalysis.jsx
│   │   │   ├── CognitiveAnalysis.jsx
│   │   │   └── PredictionPanel.jsx
│   │   │
│   │   └── App.jsx
│   │
│   └── package.json
│
├── notebooks/
│   └── exploratory_analysis.ipynb
│
└── results/
    ├── figures/
    └── reports/
```

---

# 15. Prototype vs Full Research System

## Prototype

```text
Existing MRI-derived regional data
              ↓
      Mathematical analysis
              ↓
       Z-score calculation
              ↓
     Cognitive associations
              ↓
       ML prediction
              ↓
      Interactive dashboard
```

## Full Research System

```text
Raw 3D T1 MRI
      ↓
MRI preprocessing
      ↓
Brain segmentation
      ↓
Regional volume extraction
      ↓
Quality control
      ↓
Normative modelling
      ↓
Individual Z-scores
      ↓
Cognitive analysis
      ↓
Machine learning
      ↓
Validation
      ↓
Research dashboard
```

The prototype intentionally uses established MRI-derived regional measurements rather than developing a new segmentation system.

---

# 16. Final System Output

The final prototype produces an individualized structural-cognitive profile:

```text
                    SUBJECT
                       │
                       ▼
              Regional Brain Data
                       │
                       ▼
               Expected Volumes
                       │
                       ▼
                 Regional Z-Scores
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
       Structural Profile   Cognitive Profile
             │                   │
             └─────────┬─────────┘
                       ▼
               Statistical Results
                       │
                       ▼
                ML Prediction
                       │
                       ▼
              Interactive Report
```

The system therefore moves beyond a simple dementia classification and provides an interpretable view of **regional structural abnormalities and their statistical relationship with cognitive performance**.

---

# 17. Research Interpretation

The system should be interpreted as a **research and analytical framework**.

A structural abnormality and a cognitive association do not by themselves establish causation.

The prototype is not intended to provide:

* Clinical diagnosis
* Medical treatment recommendations
* Definitive prognosis
* Direct measurement of neural activity

Its purpose is to investigate the relationship between **macroscopic brain structure and cognitive performance** using quantitative MRI-derived measurements.
