from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd
import os

app = FastAPI()

# ========================================================================
# 1. CẤU HÌNH CORS (Bắt buộc để Frontend gọi được Backend)
# ========================================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Trong thực tế, bạn nên thay "*" bằng link Vercel của bạn
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========================================================================
# 2. NẠP MODEL VÀ ENCODER
# ========================================================================
# Sử dụng đường dẫn tương đối để Render không bị lỗi tìm file
BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "model", "xgb_global.pkl")
ENCODER_PATH = os.path.join(BASE_DIR, "model", "label_encoder.pkl")

try:
    xgb_model = joblib.load(MODEL_PATH)
    le = joblib.load(ENCODER_PATH)
    # Lấy danh sách cột mà model yêu cầu để sắp xếp cho đúng
    FEATURES_ORDER = xgb_model.get_booster().feature_names
    print(f"✅ Backend Ready! Model yêu cầu {len(FEATURES_ORDER)} features.")
except Exception as e:
    print(f"❌ Lỗi nạp model: {e}")

@app.get("/")
def home():
    return {"message": "API Dự báo Tỷ lệ sinh đang hoạt động!"}

# ========================================================================
# 3. LOGIC DỰ BÁO CHÍNH
# ========================================================================
@app.post("/predict")
async def get_prediction(request: Request):
    try:
        payload = await request.json()
        history = payload.get("history") 
        
        if not history or len(history) < 3:
            return {"status": "error", "message": "Dữ liệu không đủ 3 năm gần nhất."}

        # Chuyển dữ liệu từ Frontend gửi qua thành DataFrame
        df = pd.DataFrame(history)
        
        # Đảm bảo tên cột nhất quán (biến tất cả thành chữ thường để so khớp)
        df.columns = [c.lower() for c in df.columns]
        
        # Sắp xếp theo năm để lấy Lag 1, 2, 3 chính xác
        df = df.sort_values("year")

        # Lấy giá trị birth_rate của 3 năm gần nhất (Lag)
        lags = df['birth_rate'].values
        
        # Lấy dòng dữ liệu mới nhất (năm 2021) làm base cho các chỉ số khác
        latest_row = df.iloc[-1].to_dict()
        
        # Xác định Area Code (REF_AREA)
        area_code = latest_row.get('ref_area')

        # Xây dựng input_data khớp chính xác với FEATURES_ORDER của model
        input_dict = {}
        for col in FEATURES_ORDER:
            # Ưu tiên tính toán các cột Lag
            if col == "lag_1":
                input_dict[col] = lags[-1] # Giá trị năm 2021
            elif col == "lag_2":
                input_dict[col] = lags[-2] # Giá trị năm 2020
            elif col == "lag_3":
                input_dict[col] = lags[-3] # Giá trị năm 2019
            # Mã hóa quốc gia
            elif col == "country_encoded":
                try:
                    input_dict[col] = le.transform([area_code])[0]
                except:
                    input_dict[col] = 0 # Nếu quốc gia mới chưa có trong encoder
            # Các cột kinh tế khác (GDP, CPI, v.v.)
            elif col in latest_row:
                input_dict[col] = latest_row[col]
            else:
                input_dict[col] = 0.0 # Điền 0 nếu thiếu dữ liệu

        # Tạo DataFrame đầu vào cuối cùng với thứ tự cột chuẩn
        X_predict = pd.DataFrame([input_dict])[FEATURES_ORDER]

        # Thực hiện dự báo
        prediction = xgb_model.predict(X_predict)
        
        return {
            "status": "success",
            "predicted_val": round(float(prediction[0]), 3),
            "country": area_code
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    # Trên Render, biến PORT sẽ được cấp tự động
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run(app, host="0.0.0.0", port=port)