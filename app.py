from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd
import numpy as np

# Initialize FastAPI
app = FastAPI(title="FedEx AI Debt Allocator - Production Grade")

# Enable CORS for your HTML Dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the saved Model and Scaler
model = joblib.load('fedex_risk_model.pkl')
scaler = joblib.load('fedex_scaler.pkl')

class CustomerData(BaseModel):
    DSO: int
    Lag_Trend: int
    Balance_Age: int
    MCA_Status: int  # 0: Active, 1: Strike Off, 2: Liquidation
    Credit_Score: int
    Company_Age: int
    Has_Dispute: int
    Invoice_Error: int
    Email_Open_Rate: float
    Response_Lat: float
    Sentiment: float
    Broken_Promises: int
    PTP_Integrity: float

@app.post("/predict")
def predict_allocation(data: CustomerData):
    # 1. Convert to Dict and DataFrame
    input_dict = data.dict()
    
    # --- STEP 1: LEGAL & STATUS HARD-STOPS (HEURISTICS) ---
    # If the company is liquidating, ML nuance doesn't matter.
    if input_dict['MCA_Status'] == 2:
        return {
            "probability_to_pay": 0.05,
            "allocation_result": "DEBT COLLECTION AGENCY (DCA)",
            "recommendation": "CRITICAL: Company is under Liquidation. High probability of total loss. Immediate DCA referral."
        }
    
    if input_dict['MCA_Status'] == 1:
        return {
            "probability_to_pay": 0.18,
            "allocation_result": "DEBT COLLECTION AGENCY (DCA)",
            "recommendation": "WARNING: Company is Strike Off. Entity no longer legally active. High risk."
        }

    # --- STEP 2: ML PREDICTION FOR ACTIVE COMPANIES ---
    input_df = pd.DataFrame([input_dict])
    
    # Feature Engineering (Consistent with Training)
    input_df['Relative_Ageing'] = input_df['Balance_Age'] - input_df['DSO']
    input_df['Interaction_Quality'] = input_df['Sentiment'] * input_df['Email_Open_Rate']
    input_df['Risk_Multiplier'] = 1 
    
    # FIX: Handle Company Age Outliers
    # We clip the age at 30 for the scaler so it doesn't break the math
    original_age = input_df['Company_Age'].values[0]
    input_df['Company_Age'] = input_df['Company_Age'].clip(upper=30)

    # Scaling and Prediction
    scaled_data = scaler.transform(input_df)
    prob = model.predict_proba(scaled_data)[0][1]

    # --- STEP 3: AGE STABILITY BONUS ---
    # If the company is > 30 years old, we add a "Stability Bonus"
    # because they have survived multiple economic cycles.
    if original_age >= 50:
        prob = min(0.99, prob + 0.15) # Add 15% bonus for veteran firms
    elif original_age >= 25:
        prob = min(0.99, prob + 0.05) # Add 5% bonus

    # Final Decision Logic
    if prob > 0.80:
        decision = "INTERNAL AR (AUTOMATED)"
        reason = f"Customer is stable (Age: {original_age}). Low risk of default."
    elif prob > 0.45:
        decision = "INTERNAL AR (HUMAN)"
        reason = "Medium risk profile. Engagement suggested before outsourcing."
    else:
        decision = "DEBT COLLECTION AGENCY (DCA)"
        reason = "Pattern of non-payment detected. Risk exceeds internal threshold."

    return {
        "probability_to_pay": round(float(prob), 4),
        "allocation_result": decision,
        "recommendation": reason
    }