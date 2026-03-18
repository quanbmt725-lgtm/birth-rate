from pydantic import BaseModel
from typing import List, Dict, Any

class InputData(BaseModel):
    history: List[Dict[str, Any]]

@app.post("/predict")
async def get_prediction(data: InputData):
    try:
        history = data.history
        
        if not history or len(history) < 3:
            return {"status": "error", "message": "Cần dữ liệu 3 năm"}

        df = pd.DataFrame(history)
        df = df.sort_values("Year")

        lags = df['birth_rate'].values
        latest_row = df.iloc[-1].to_dict()

        area_key = 'REF_AREA' if 'REF_AREA' in latest_row else 'ref_area'

        input_data = {}
        for col in FEATURES_ORDER:
            if col == "lag_1":
                input_data[col] = lags[-1]
            elif col == "lag_2":
                input_data[col] = lags[-2]
            elif col == "lag_3":
                input_data[col] = lags[-3]
            elif col == "country_encoded":
                input_data[col] = le.transform([latest_row[area_key]])[0]
            elif col in latest_row:
                input_data[col] = latest_row[col]
            else:
                input_data[col] = 0.0

        X_predict = pd.DataFrame([input_data])[FEATURES_ORDER]
        prediction = xgb_model.predict(X_predict)

        return {
            "status": "success",
            "predicted_val": float(prediction[0])
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}