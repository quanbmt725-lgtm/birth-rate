from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import joblib
import pandas as pd
import os
import traceback

app = FastAPI()

# 1. CẤU HÌNH CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. NẠP MODEL
BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "xgb_global.pkl")
ENCODER_PATH = os.path.join(BASE_DIR, "label_encoder.pkl")

try:
    xgb_model = joblib.load(MODEL_PATH)
    le = joblib.load(ENCODER_PATH)
    FEATURES_ORDER = xgb_model.get_booster().feature_names
    print(f"✅ Backend Ready! Model yêu cầu {len(FEATURES_ORDER)} features.")
except Exception as e:
    print(f"❌ Lỗi nạp model: {e}")

@app.get("/")
def home():
    return {"message": "API AI đang chạy bình thường trên Render!"}

# ========================================================================
# ĐÂY LÀ PHẦN THÊM VÀO: BẢN THIẾT KẾ ĐẦU VÀO CHO SWAGGER UI
# ========================================================================
class PredictionInput(BaseModel):
    history: List[Dict[str, Any]]

# 3. LOGIC XỬ LÝ CHÍNH
@app.post("/predict")
async def get_prediction(data: PredictionInput):
    try:
        # Lấy data thông qua Schema thay vì Request
        history = data.history 
        
        if not history or len(history) < 3:
            return {"status": "error", "message": f"Dữ liệu gửi lên chỉ có {len(history)} năm. AI cần đủ 3 năm."}

        df = pd.DataFrame(history)
        df.columns = [str(c).lower() for c in df.columns]

        if 'year' not in df.columns or 'birth_rate' not in df.columns:
            return {"status": "error", "message": f"Thiếu cột 'year' hoặc 'birth_rate'."}

        df = df.sort_values("year")
        lags = df['birth_rate'].values
        
        latest_row = df.iloc[-1].to_dict()
        area_code = latest_row.get('ref_area', 'UNKNOWN')

        input_dict = {}
        for col in FEATURES_ORDER:
            if col == "lag_1":
                input_dict[col] = float(lags[-1])
            elif col == "lag_2":
                input_dict[col] = float(lags[-2])
            elif col == "lag_3":
                input_dict[col] = float(lags[-3])
            elif col == "country_encoded":
                try:
                    input_dict[col] = le.transform([area_code])[0]
                except:
                    input_dict[col] = 0 
            elif col in latest_row:
                try:
                    input_dict[col] = float(latest_row[col])
                except:
                    input_dict[col] = 0.0
            else:
                input_dict[col] = 0.0 

        X_predict = pd.DataFrame([input_dict])[FEATURES_ORDER]
        prediction = xgb_model.predict(X_predict)
        
        return {
            "status": "success",
            "predicted_val": round(float(prediction[0]), 3),
            "country": area_code
        }

    except Exception as e:
        print("🔥 LỖI NGHIÊM TRỌNG TẠI BACKEND:")
        traceback.print_exc()
        return {"status": "error", "message": f"Server AI bị lỗi: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run(app, host="0.0.0.0", port=port)