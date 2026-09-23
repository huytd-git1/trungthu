@echo off
chcp 65001 > nul
echo ==========================================================
echo   🌕 ĐANG KHỞI CHẠY TRẢI NGHIỆM TRUNG THU 3D CUNG TRĂNG...
echo ==========================================================
echo 👉 Mở trên máy tính: http://localhost:8080
echo 👉 Mở trên điện thoại (cùng mạng Wi-Fi): http://192.168.0.102:8080
echo.
echo Nhấn Ctrl + C để dừng máy chủ khi không sử dụng nữa.
echo ----------------------------------------------------------
timeout /t 2 /nobreak > nul
start http://localhost:8080
python -m http.server 8080
