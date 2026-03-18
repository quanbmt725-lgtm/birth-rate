from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd
import os
import traceback

app = FastAPI()

# ========================================================================
# 1. CẤU HÌNH CORS (Bắt buộc để Frontend gọi được Backend)
# ========================================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========================================================================
# 2. NẠP MODEL VÀ ENCODER
# ========================================================================
BASE_DIR = os.path.dirname(__file__)
# Nếu file .pkl nằm cùng thư mục với main.py, dùng code này:
MODEL_PATH = os.path.join(BASE_DIR, "xgb_global.pkl")
ENCODER_PATH = os.path.join(BASE_DIR, "label_encoder.pkl")

# (Nếu file .pkl nằm trong thư mục 'model', thì sửa thành:
# MODEL_PATH = os.path.join(BASE_DIR, "model", "xgb_global.pkl")
# ENCODER_PATH = os.path.join(BASE_DIR, "model", "label_encoder.pkl") )

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
# 3. LOGIC XỬ LÝ DỮ LIỆU CHỐNG LỖI
# ========================================================================
@app.post("/predict")
async def get_prediction(request: Request):
    try:
        payload = await request.json()
        history = payload.get("history", [])
        
        # Bẫy lỗi số 1: Thiếu dữ liệu
        if not history or len(history) < 3:
            return {"status": "error", "message": f"Dữ liệu gửi lên chỉ có {len(history)} năm. AI cần đủ 3 năm 2019, 2020, 2021."}

        # Đưa vào Pandas DataFrame
        df = pd.DataFrame(history)
        
        # Bẫy lỗi số 2: Xử lý chữ hoa/chữ thường đồng loạt
        df.columns = [str(c).lower() for c in df.columns]

        # Kiểm tra xem có đủ các cột cần thiết không
        if 'year' not in df.columns or 'birth_rate' not in df.columns:
            return {"status": "error", "message": f"Dữ liệu gửi thiếu cột 'year' hoặc 'birth_rate'. Cột hiện có: {list(df.columns)}"}

        # Sắp xếp theo năm để lấy lag
        df = df.sort_values("year")
        lags = df['birth_rate'].values
        
        # Lấy dòng mới nhất (2021)
        latest_row = df.iloc[-1].to_dict()
        area_code = latest_row.get('ref_area', 'UNKNOWN')

        # Ghép data vào Model
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
                    input_dict[col] = 0 # Nước lạ chưa train
            elif col in latest_row:
                # Ép kiểu float phòng trường hợp Supabase trả về string
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
        # Bẫy lỗi số 3: In ra toàn bộ lịch sử lỗi trên Terminal của Render
        print("🔥 LỖI NGHIÊM TRỌNG TẠI BACKEND:")
        traceback.print_exc()
        return {"status": "error", "message": f"Server AI bị lỗi: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run(app, host="0.0.0.0", port=port)