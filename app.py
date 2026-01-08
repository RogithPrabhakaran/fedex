from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np

# 1. Initialize FastAPI
app = FastAPI(title="FedEx Debt Allocation Engine")

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="FedEx Debt Allocation Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows all origins for hackathon ease
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Load the Brains (Model and Scaler)
# Make sure you have run your training script first to create these files!
model = joblib.load('fedex_risk_model.pkl')
scaler = joblib.load('fedex_scaler.pkl')

# 3. Define the Input Data Structure (Schema)
class CustomerData(BaseModel):
    DSO: int
    Lag_Trend: int
    Balance_Age: int
    MCA_Status: int  # 0: Active, 1: Strike Off, 2: Liquidation
    Credit_Score: int
    Company_Age: int
    Has_Dispute: int # 0 or 1
    Invoice_Error: int # 0 or 1
    Email_Open_Rate: float
    Response_Lat: float
    Sentiment: float
    Broken_Promises: int
    PTP_Integrity: float

# 4. The Prediction Endpoint
@app.post("/predict")
def predict_allocation(data: CustomerData):
    # 1. Convert input JSON to DataFrame
    input_dict = data.dict()
    input_df = pd.DataFrame([input_dict])
    
    # 2. FEATURE ENGINEERING (Must match your Training Script exactly!)
    # Match the "clean_and_feature_engineer" logic from your training code
    input_df['Relative_Ageing'] = input_df['Balance_Age'] - input_df['DSO']
    
    # Missing Feature 1: Interaction_Quality
    input_df['Interaction_Quality'] = input_df['Sentiment'] * input_df['Email_Open_Rate']
    
    # Missing Feature 2: Risk_Multiplier
    # Logic: 5 if MCA_Status > 0, else 1
    input_df['Risk_Multiplier'] = input_df['MCA_Status'].apply(lambda x: 5 if x > 0 else 1)
    
    # 3. SCALING
    # The scaler expects columns in the exact order they were fitted
    # Ensure the order is: DSO, Lag_Trend, Balance_Age, MCA_Status, Credit_Score, 
    # Company_Age, Has_Dispute, Invoice_Error, Email_Open_Rate, Response_Lat, 
    # Sentiment, Broken_Promises, PTP_Integrity, Relative_Ageing, Interaction_Quality, Risk_Multiplier
    scaled_data = scaler.transform(input_df)
    
    # 4. INFERENCE
    prob = model.predict_proba(scaled_data)[0][1]
    
    # 5. DECISION LOGIC
    if prob > 0.80:
        decision = "INTERNAL AR (AUTOMATED)"
        reason = "High probability of self-cure. Sending automated reminders."
    elif prob > 0.45:
        decision = "INTERNAL AR (HUMAN)"
        reason = "Medium risk. Requires FedEx collector to negotiate."
    else:
        decision = "DEBT COLLECTION AGENCY (DCA)"
        reason = "High risk or Legal status issue. Outsourcing to agency."

    return {
        "probability_to_pay": round(float(prob), 4),
        "allocation_result": decision,
        "recommendation": reason
    }

# To run this, use: uvicorn app:app --reload