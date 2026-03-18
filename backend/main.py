from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import joblib
import pandas as pd
import os
import traceback

app = FastAPI()

# 1. CẤU HÌNH CORS CHO VERCEL
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. NẠP MODEL VÀ ENCODER (Giữ nguyên đường dẫn chuẩn của bạn)
MODEL_DIR = os.path.join(os.path.dirname(__file__), "model")
try:
    xgb_model = joblib.load(os.path.join(MODEL_DIR, "xgb_global.pkl"))
    le = joblib.load(os.path.join(MODEL_DIR, "label_encoder.pkl"))
    FEATURES_ORDER = xgb_model.get_booster().feature_names
    print(f"✅ Model Ready! Cần {len(FEATURES_ORDER)} cột features.")
except Exception as e:
    print(f"❌ Lỗi nạp file: {e}")

@app.get("/")
def home():
    return {"message": "API Dự báo Tỷ lệ sinh đang hoạt động!"}

# ========================================================================
# SCHEMA CHO SWAGGER UI TEST
# ========================================================================
class PredictionInput(BaseModel):
    history: List[Dict[str, Any]]

# ========================================================================
# 3. LOGIC DỰ BÁO CHÍNH (Giữ nguyên logic tuyệt vời của bạn)
# ========================================================================
@app.post("/predict")
async def get_prediction(data: PredictionInput):
    try:
        history = data.history 
        
        if not history or len(history) < 3:
            return {"status": "error", "message": "Cần dữ liệu 3 năm (2019, 2020, 2021)"}

        # CHUYỂN THÀNH DATAFRAME
        df = pd.DataFrame(history)
        print("Cột nhận được từ Web:", df.columns.tolist())

        # Kiểm tra xem web gửi lên là 'Year' hay 'year' để sort cho đúng
        year_col = 'Year' if 'Year' in df.columns else 'year'
        df = df.sort_values(year_col)

        # TÍNH TOÁN LAG
        lags = df['birth_rate'].values
        
        # CHUẨN BỊ DỮ LIỆU INPUT
        latest_row = df.iloc[-1].to_dict()
        
        # Xác định tên cột REF_AREA
        area_key = 'REF_AREA' if 'REF_AREA' in latest_row else 'ref_area'
        if area_key not in latest_row:
             return {"status": "error", "message": "Không tìm thấy cột REF_AREA"}

        # Tạo dict input theo đúng danh sách FEATURES_ORDER của model
        input_data = {}
        for col in FEATURES_ORDER:
            if col == "lag_1":
                input_data[col] = float(lags[-1])
            elif col == "lag_2":
                input_data[col] = float(lags[-2])
            elif col == "lag_3":
                input_data[col] = float(lags[-3])
            elif col == "country_encoded":
                try:
                    input_data[col] = le.transform([latest_row[area_key]])[0]
                except:
                    input_data[col] = 0 # Tránh lỗi nếu gặp quốc gia lạ
            elif col in latest_row:
                try:
                    input_data[col] = float(latest_row[col]) # Ép kiểu số phòng hờ
                except:
                    input_data[col] = 0.0
            else:
                input_data[col] = 0.0 # Điền 0 nếu thiếu cột

        # TẠO DATAFRAME VỚI THỨ TỰ CỘT CHUẨN
        X_predict = pd.DataFrame([input_data])[FEATURES_ORDER]

        # DỰ BÁO
        prediction = xgb_model.predict(X_predict)
        print(f"✅ Dự báo thành công cho {latest_row[area_key]}: {prediction[0]}")

        return {
            "status": "success",
            "predicted_val": round(float(prediction[0]), 3),
            "country": latest_row[area_key]
        }

    except Exception as e:
        print("🔥 LỖI TẠI SERVER:")
        traceback.print_exc()
        return {"status": "error", "message": str(e)}

# ========================================================================
# CHẠY SERVER (Cấu hình chuẩn cho Render)
# ========================================================================
if __name__ == "__main__":
    import uvicorn
    # Render yêu cầu host 0.0.0.0 và tự cấp Port
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run(app, host="0.0.0.0", port=port)