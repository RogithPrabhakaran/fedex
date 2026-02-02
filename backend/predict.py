#!/usr/bin/env python3
import sys
import json
import traceback
import os

from math import isnan

# use joblib to load scikit-learn pipeline objects
try:
    import joblib
    import numpy as np
    import pandas as pd
except Exception as e:
    print(json.dumps({"success": False, "error": "missing-python-dependencies", "message": str(e)}))
    sys.exit(0)

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'gb_model.pkl')
PREPRO_PATH = os.path.join(os.path.dirname(__file__), 'preprocessor.pkl')

THRESHOLD_LOW = 0.8
THRESHOLD_MED = 0.6

# Optionally override thresholds by fetching from the API if environment variable is set.
RISK_SETTINGS_URL = os.environ.get('RISK_SETTINGS_URL')  # e.g. http://localhost:5000/api/settings/risk-thresholds
if RISK_SETTINGS_URL:
    try:
        import requests
        resp = requests.get(RISK_SETTINGS_URL, timeout=3)
        if resp.status_code == 200:
            data = resp.json()
            rt = data.get('risk_thresholds') or {}
            if 'low_max' in rt and 'med_min' in rt and 'med_max' in rt and 'high_min' in rt:
                THRESHOLD_LOW = float(rt.get('med_max', 0.6))
                THRESHOLD_MED = float(rt.get('med_min', 0.6))
    except Exception:
        pass


def load_objects():
    model = joblib.load(MODEL_PATH)
    pre = joblib.load(PREPRO_PATH)
    return model, pre


def classify(score):
    if score > THRESHOLD_LOW:
        return "LOW_RISK", "Extend terms"
    if score >= THRESHOLD_MED:
        return "MEDIUM_RISK", "Monitor closely"
    return "HIGH_RISK", "Send reminder"


def main():
    try:
        raw = sys.stdin.read()
        payload = json.loads(raw)
    except Exception as e:
        print(json.dumps({"success": False, "error": "invalid_input", "message": str(e)}))
        sys.exit(0)

    try:
        model, pre = load_objects()
    except Exception as e:
        print(json.dumps({"success": False, "error": "model_load_failed", "message": str(e)}))
        sys.exit(0)

    try:
        # convert payload to DataFrame with expected column order
        df = pd.DataFrame([payload])
        # If pipeline already includes preprocessing then just use model.predict_proba
        if hasattr(model, 'predict_proba') and not pre:
            X = df
        else:
            # if preprocessor provided, transform then predict. Be resilient to missing columns.
            try:
                X = pre.transform(df)
            except Exception as e:
                # Try to infer required columns from preprocessor attributes and fill sensibly
                expected_cols = None
                if hasattr(pre, 'feature_names_in_'):
                    expected_cols = list(pre.feature_names_in_)
                elif hasattr(pre, 'get_feature_names_out'):
                    try:
                        expected_cols = list(pre.get_feature_names_out(df.columns))
                    except Exception:
                        expected_cols = None

                if expected_cols:
                    # try to detect numeric vs categorical columns from the preprocessor
                    num_cols = []
                    cat_cols = []
                    try:
                        for name, trans, cols in getattr(pre, 'transformers_', []):
                            if name == 'num':
                                num_cols = cols or []
                            if name == 'cat':
                                cat_cols = cols or []
                    except Exception:
                        pass

                    for col in expected_cols:
                        if col not in df.columns:
                            if col in num_cols:
                                df[col] = 0
                            elif col in cat_cols:
                                df[col] = ''
                            else:
                                df[col] = 0
                    X = pre.transform(df)
                else:
                    # As a last resort try to fill any columns found in the error message
                    msg = str(e)
                    # naive parse for column names in brackets
                    import re
                    cols = re.findall(r"\'([a-zA-Z0-9_\-]+)\'", msg)
                    for col in cols:
                        if col not in df.columns:
                            df[col] = 0
                    X = pre.transform(df)

        proba = None
        try:
            # If the model is a Pipeline (has 'steps'), prefer passing the DataFrame so ColumnTransformer can use string column selectors
            if hasattr(model, 'steps'):
                proba = model.predict_proba(df)
            else:
                proba = model.predict_proba(X)

            score = float(proba[:,1][0]) if proba.shape[1] > 1 else float(proba[:,0][0])
        except Exception:
            # fall back to predict (binary class) - map to 0/1
            try:
                if hasattr(model, 'steps'):
                    pred = model.predict(df)
                else:
                    pred = model.predict(X)
                score = 1.0 if pred[0] == 1 or str(pred[0]).upper() == 'ON_TIME' else 0.0
            except Exception as e:
                raise

        if score is None or (isinstance(score, float) and (isnan(score) or score < 0 or score > 1)):
            raise ValueError('invalid_score')

        risk_category, action = classify(score)
        out = {
            "success": True,
            "risk_score": round(float(score), 4),
            "prediction": "ON_TIME" if score >= 0.5 else "LATE_OR_DEFAULT",
            "risk_category": risk_category,
            "business_action": action,
            "input_data": payload
        }
        print(json.dumps(out))
    except Exception as e:
        tb = traceback.format_exc()
        print(json.dumps({"success": False, "error": "prediction_failed", "message": str(e), "trace": tb}))
        sys.exit(0)


if __name__ == '__main__':
    main()
