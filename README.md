# MRI-Based Regional Brain Abnormality and Cognitive Function Analysis

## Overview

This project presents an MRI-based research and analytical framework for studying the relationship between **regional brain structure and cognitive function in dementia and cognitive impairment**.

Instead of simply classifying a person as having dementia or not, the system analyzes **which brain regions show structural abnormalities** and investigates how those abnormalities are associated with specific cognitive functions such as **memory and executive function**.

The prototype combines regional brain measurements, demographic information, statistical analysis, normative modelling, and machine learning into an interactive research dashboard.

---

## Project Workflow

```text
MRI / MRI-derived Data
        ↓
Regional Brain Measurements
        ↓
Age / Sex / ICV Normalization
        ↓
Expected Regional Volume
        ↓
Regional Z-Score
        ↓
Structural Abnormality Profile
        ↓
Cognitive Association Analysis
        ↓
Machine Learning Prediction
        ↓
Interactive Research Dashboard
```

---

## What Does the System Analyze?

The system focuses on structural measurements from regions such as:

* Hippocampus
* Entorhinal / medial temporal regions
* Frontal regions
* Temporal regions
* Parietal regions
* Whole-brain measurements
* Ventricular measurements
* Intracranial volume (ICV)

These measurements are analyzed alongside:

* Age
* Sex
* Cognitive assessment scores

---

## Regional Abnormality Analysis

Raw brain volume alone is difficult to interpret because brain structure naturally varies with factors such as age, sex, and head size.

The system therefore estimates the expected volume of a brain region based on demographic and anatomical factors.

### Expected Volume

```text
Expected Volume =
β₀ + β₁(Age) + β₂(Sex) + β₃(ICV)
```

### Z-Score

```text
Z =
(Observed Volume − Expected Volume)
─────────────────────────────────
       Residual Standard Deviation
```

A negative Z-score indicates that the observed regional volume is below the expected value.

This allows the system to represent each individual as a **regional structural abnormality profile**.

---

## Cognitive Function Analysis

The system investigates relationships between regional structural abnormalities and cognitive performance.

Examples include:

```text
Hippocampal abnormality
          ↓
      Memory
```

```text
Frontal-region abnormality
          ↓
   Executive Function
```

Statistical techniques such as correlation and regression are used to measure the strength and direction of these relationships.

The results are interpreted as **statistical associations rather than proof of causation**.

---

## Machine Learning

Machine-learning models are used as a secondary analysis to investigate whether regional brain measurements can predict continuous cognitive scores.

Possible models include:

* Linear Regression
* Random Forest Regression
* Gradient Boosting

The prototype evaluates models using:

* MAE
* RMSE
* R²
* Predicted vs. actual cognitive scores

The system can also compare:

```text
Demographics
      vs.
Raw Regional Volumes
      vs.
Normalized Regional Z-Scores
      vs.
Z-Scores + Demographics
```

---

## Prototype Dashboard

The final prototype provides an interactive interface containing:

* Subject information
* Regional brain measurements
* Regional abnormality Z-scores
* Brain-region visualization
* Observed vs. expected volume comparisons
* Cognitive relationship graphs
* Correlation results
* Cognitive-score predictions
* Machine-learning performance metrics

---

## Prototype Architecture

```text
                    MRI DATA
                       │
                       ▼
             Regional Brain Data
                       │
                       ▼
             Normative Modelling
              Age + Sex + ICV
                       │
                       ▼
                  Z-Scores
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
      Structural Analysis   Cognitive Analysis
             │                   │
             └─────────┬─────────┘
                       ▼
                Statistical
                   Analysis
                       │
                       ▼
                ML Prediction
                       │
                       ▼
               Web Dashboard
```

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for the detailed system architecture.

---

## Technology Stack

### Data & Analysis

* Python
* Pandas
* NumPy
* SciPy
* Scikit-learn

### MRI / Neuroimaging

The project is designed to work with MRI-derived regional measurements produced using established neuroimaging methods and datasets.

### Frontend

The prototype will use a modern interactive web interface for visualizing the analysis results.

---

## Research Scope

This project focuses on **macroscopic structural characteristics obtained from 3D T1-weighted MRI**.

It does not directly measure:

* Neural transmission
* Synaptic activity
* Neurotransmitter activity
* Membrane potential
* Functional connectivity

Therefore, structural abnormalities are interpreted as indicators **associated with cognitive systems**, rather than direct measurements of brain function.

This project is intended as a **research and analytical framework**, not a clinical diagnostic or treatment system.

---

## Dataset

The prototype is designed to use established research datasets such as:

* ADNI
* OASIS

The exact dataset and available variables will be verified before the final experimental implementation.

---

## Project Goals

1. Identify regional structural abnormalities.
2. Normalize regional measurements according to age, sex, and ICV.
3. Generate individualized regional Z-scores.
4. Investigate relationships between brain regions and cognitive functions.
5. Predict continuous cognitive scores using machine learning.
6. Compare raw regional measurements with normalized abnormalities.
7. Present the results through an interpretable interactive dashboard.

---

## Expected Outcome

The final system will produce an **individualized structural-cognitive profile** showing:

```text
Brain Region
     ↓
Observed Volume
     ↓
Expected Volume
     ↓
Abnormality Z-Score
     ↓
Associated Cognitive Domain
     ↓
Statistical Relationship
     ↓
Predicted Cognitive Performance
```

The objective is to move beyond a simple **"dementia / no dementia"** classification and provide a more interpretable analysis of **regional brain abnormalities and their relationship with cognitive performance**.

---

## Disclaimer

This project is developed for **academic and research purposes**.

The outputs represent statistical associations and predictive modelling results and should **not be interpreted as a medical diagnosis, prognosis, or treatment recommendation**.
