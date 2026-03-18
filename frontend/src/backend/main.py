from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. NẠP MODEL VÀ ENCODER (Đảm bảo file nằm đúng thư mục model)
MODEL_DIR = os.path.join(os.path.dirname(__file__), "model")
try:
    xgb_model = joblib.load(os.path.join(MODEL_DIR, "xgb_global.pkl"))
    le = joblib.load(os.path.join(MODEL_DIR, "label_encoder.pkl"))
    # Lấy danh sách features chuẩn từ model
    FEATURES_ORDER = xgb_model.get_booster().feature_names
    print(f"✅ Model Ready! Cần {len(FEATURES_ORDER)} cột features.")
except Exception as e:
    print(f"❌ Lỗi nạp file: {e}")

@app.post("/predict")
async def get_prediction(request: Request):
    try:
        payload = await request.json()
        history = payload.get("history") 
        
        if not history or len(history) < 3:
            return {"status": "error", "message": "Cần dữ liệu 3 năm (2019, 2020, 2021)"}

        # 2. CHUYỂN THÀNH DATAFRAME VÀ KIỂM TRA TÊN CỘT
        df = pd.DataFrame(history)
        
        # In ra để bạn debug trong Terminal xem cột tên là gì
        print("Cột nhận được từ Web:", df.columns.tolist())

        # Sắp xếp theo năm để lấy lag chính xác
        df = df.sort_values("Year")

        # 3. TÍNH TOÁN LAG (Lấy birth_rate của 2021, 2020, 2019)
        # lag_1 là năm gần nhất (2021)
        lags = df['birth_rate'].values
        
        # 4. CHUẨN BỊ DỮ LIỆU INPUT
        # Lấy dòng mới nhất (năm 2021) làm gốc cho các chỉ số kinh tế
        latest_row = df.iloc[-1].to_dict()
        
        # Xác định tên cột REF_AREA (đôi khi bị viết hoa/thường)
        area_key = 'REF_AREA' if 'REF_AREA' in latest_row else 'ref_area'
        if area_key not in latest_row:
             return {"status": "error", "message": "Không tìm thấy cột REF_AREA"}

        # Tạo dict input theo đúng danh sách FEATURES_ORDER của model
        input_data = {}
        for col in FEATURES_ORDER:
            if col == "lag_1":
                input_data[col] = lags[-1] # birth_rate 2021
            elif col == "lag_2":
                input_data[col] = lags[-2] # birth_rate 2020
            elif col == "lag_3":
                input_data[col] = lags[-3] # birth_rate 2019
            elif col == "country_encoded":
                input_data[col] = le.transform([latest_row[area_key]])[0]
            elif col in latest_row:
                input_data[col] = latest_row[col]
            else:
                input_data[col] = 0.0 # Điền 0 nếu thiếu cột

        # 5. TẠO DATAFRAME VỚI THỨ TỰ CỘT CHUẨN
        X_predict = pd.DataFrame([input_data])[FEATURES_ORDER]

        # 6. DỰ BÁO
        prediction = xgb_model.predict(X_predict)
        
        print(f"✅ Dự báo thành công cho {latest_row[area_key]}: {prediction[0]}")

        return {
            "status": "success",
            "predicted_val": float(prediction[0])
        }

    except Exception as e:
        print(f"🔥 Lỗi tại Server: {str(e)}")
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)