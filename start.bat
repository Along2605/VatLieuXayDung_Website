@echo off
:: ============================================================
:: start.bat — Khởi chạy toàn bộ hệ thống VLXD với 1 lệnh
:: Dành cho Windows
:: ============================================================

title VLXD Duc Phien - Docker Startup

echo.
echo  ==========================================
echo   VLXD DUC PHIEN - One-Click Docker Start
echo  ==========================================
echo.

:: ── Kiểm tra .env ─────────────────────────────────────────
if not exist ".env" (
    echo [WARN] Khong tim thay file .env
    echo [INFO] Dang tao .env tu .env.example...
    copy ".env.example" ".env" >nul
    echo.
    echo [!!!] Hay mo file .env va dien NGROK_AUTHTOKEN truoc khi tiep tuc!
    echo       Dang ky mien phi tai: https://ngrok.com
    echo.
    pause
    exit /b 1
)

:: ── Kiểm tra NGROK_AUTHTOKEN ──────────────────────────────
findstr /i "NGROK_AUTHTOKEN=your_ngrok_authtoken_here" .env >nul
if %errorlevel% equ 0 (
    echo [!!!] NGROK_AUTHTOKEN chua duoc cau hinh trong file .env!
    echo       1. Mo file .env
    echo       2. Thay "your_ngrok_authtoken_here" bang token thuc
    echo       3. Chay lai start.bat
    echo.
    pause
    exit /b 1
)

:: ── Kiểm tra Docker đang chạy ─────────────────────────────
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERR] Docker Desktop chua chay!
    echo       Hay khoi dong Docker Desktop roi thu lai.
    pause
    exit /b 1
)

echo [OK] Docker dang chay.
echo [INFO] Dang build va khoi dong cac services...
echo.

:: ── Build & Start ─────────────────────────────────────────
docker-compose up --build -d

if %errorlevel% neq 0 (
    echo.
    echo [ERR] Co loi xay ra! Xem log bang lenh: docker-compose logs
    pause
    exit /b 1
)

echo.
echo  ==========================================
echo   He thong da khoi dong thanh cong!
echo  ==========================================
echo.
echo   Frontend  : http://localhost:5173
echo   Backend   : http://localhost:5000/api/health
echo   n8n       : http://localhost:5679
echo   ngrok UI  : http://localhost:4040  (xem public URL)
echo.
echo   De xem logs : docker-compose logs -f
echo   De dung      : docker-compose down
echo.
pause
