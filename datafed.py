import pandas as pd
import numpy as np

def generate_fedex_hackathon_data_v2(n=1200):
    np.random.seed(42)
    data = []
    
    for _ in range(n):
        # 1. Base Entity Health
        mca_status = np.random.choice([0, 1, 2], p=[0.82, 0.12, 0.06])
        credit_score = np.random.randint(580, 850) if mca_status == 0 else np.random.randint(300, 550)
        company_age = np.random.randint(1, 20)
        
        # 2. REALITY CHECK: Dispute & Invoice Errors
        # Even good companies raise disputes which stop payments
        has_dispute = np.random.choice([0, 1], p=[0.85, 0.15]) 
        invoice_error = np.random.choice([0, 1], p=[0.95, 0.05])
        
        # 3. Behavioral Features
        if mca_status == 0 and has_dispute == 0:
            dso = np.random.randint(10, 40)
            broken_promises = np.random.choice([0, 1], p=[0.9, 0.1])
        else:
            # If there's a dispute, DSO goes up even for good companies
            dso = np.random.randint(45, 95)
            broken_promises = np.random.randint(1, 4)

        ptp_integrity = 1.0 if broken_promises == 0 else max(0, 1.0 - (broken_promises * 0.25))
        
        # Sentiment logic: Disputes often lead to "Neutral/Negative" sentiment 
        # but don't mean the company is bankrupt.
        if has_dispute:
            sentiment = np.random.uniform(-0.5, 0.1) 
        else:
            sentiment = np.random.uniform(-0.2, 0.9) if mca_status == 0 else np.random.uniform(-1.0, 0.0)
            
        response_lat = np.random.uniform(2, 48) if mca_status == 0 else np.random.uniform(72, 300)

        # 4. TARGET CALCULATION (Prob_Pay) with REALISTIC NOISE
        # We reduce probability if there is a dispute, BUT it's not a default.
        base_score = (
            (credit_score / 850) * 0.35 + 
            (ptp_integrity) * 0.25 + 
            ((sentiment + 1) / 2) * 0.15 - 
            (dso / 120) * 0.15 -
            (has_dispute * 0.1) # Dispute makes payment less likely today, but not impossible
        )
        
        # Hard-stop for Liquidation
        if mca_status == 2: base_score *= 0.05
        
        # Introduce "Human Error" Noise (The Overfitting Killer)
        # 8% of the time, the result is the opposite of what features suggest
        noise = np.random.normal(0, 0.12) 
        prob_pay = np.clip(base_score + noise, 0, 1)

        data.append({
            'DSO': dso,
            'Lag_Trend': np.random.randint(-7, 18),
            'Balance_Age': dso + np.random.randint(5, 40),
            'MCA_Status': mca_status,
            'Credit_Score': credit_score,
            'Company_Age': company_age,
            'Has_Dispute': has_dispute,
            'Invoice_Error': invoice_error,
            'Email_Open_Rate': np.random.uniform(0.2, 1.0),
            'Response_Lat': round(response_lat, 1),
            'Sentiment': round(sentiment, 2),
            'Broken_Promises': broken_promises,
            'PTP_Integrity': round(ptp_integrity, 2),
            'Prob_Pay': round(prob_pay, 4)
        })

    return pd.DataFrame(data)

fedex_df = generate_fedex_hackathon_data_v2(1500)
fedex_df.to_csv("fedex_balanced_data.csv", index=False)