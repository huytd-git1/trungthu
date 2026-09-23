@echo off
chcp 65001 >nul
echo ========================================================
echo    DANG TIEN HANH PUSH CODE LEN GITHUB: huytd-git1
echo ========================================================
echo.
git add .
git commit -m "Cap nhat website Trung Thu"
echo Dang push len branch main...
git push -u origin main
echo.
if %errorlevel% equ 0 (
    echo ========================================================
    echo  PUSH THANH CONG!
    echo  Xem ma nguon tai: https://github.com/huytd-git1/trungthu2
    echo ========================================================
) else (
    echo ========================================================
    echo  CO LOI KHI PUSH!
    echo  Hay chac chan ban da tao repo ten la 'trungthu2' tai:
    echo  https://github.com/new
    echo ========================================================
)
pause
