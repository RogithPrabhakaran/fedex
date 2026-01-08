import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix
import joblib

# 1. LOAD DATA
df = pd.read_csv("fedex_balanced_data.csv")

# 2. DATA CLEANING & PREPARATION
def clean_and_feature_engineer(data):
    # Handle missing values (if any)
    data = data.fillna(data.median())
    
    # Feature Engineering: 
    # 'Relative_Ageing' tells us if this is a sudden change in behavior
    data['Relative_Ageing'] = data['Balance_Age'] - data['DSO']
    
    # 'Interaction_Quality' combines sentiment and open rate
    data['Interaction_Quality'] = data['Sentiment'] * data['Email_Open_Rate']
    
    # 'Risk_Multiplier': If MCA_Status is not Active (0), it drastically increases risk
    data['Risk_Multiplier'] = data['MCA_Status'].apply(lambda x: 5 if x > 0 else 1)
    
    # Define Target: 1 for 'Internal AR' (Likely to pay), 0 for 'DCA' (Unlikely)
    # Using 0.5 as the threshold for our synthetic data
    y = (data['Prob_Pay'] > 0.5).astype(int)
    
    # Drop columns that are ground truth or redundant
    X = data.drop(['Prob_Pay'], axis=1)
    
    return X, y

X, y = clean_and_feature_engineer(df)

# 3. SPLIT DATA
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 4. SCALING
# We scale the data so features like 'Credit_Score' (850) don't overpower 'Sentiment' (1.0)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# 5. TRAIN MODEL
# Using Random Forest for high accuracy and feature importance insights
model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
model.fit(X_train_scaled, y_train)

# 6. EVALUATION
y_pred = model.predict(X_test_scaled)
y_probs = model.predict_proba(X_test_scaled)[:, 1]

print("--- Model Performance ---")
print(f"ROC-AUC Score: {roc_auc_score(y_test, y_probs):.4f}")
print("\nClassification Report:\n", classification_report(y_test, y_pred))

# 7. SAVE ASSETS (For use in your App)
joblib.dump(model, 'fedex_risk_model.pkl')
joblib.dump(scaler, 'fedex_scaler.pkl')
print("\nModel and Scaler saved successfully!")