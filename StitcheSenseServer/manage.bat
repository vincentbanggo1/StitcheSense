@echo off
REM StitcheSense Server Management Script for Windows

:menu
cls
echo.
echo ╔══════════════════════════════════════════════════════╗
echo ║                                                      ║
echo ║              StitcheSense Server Manager             ║
echo ║                                                      ║
echo ╚══════════════════════════════════════════════════════╝
echo.
echo 1. Install Dependencies
echo 2. Start Server
echo 3. Reset Database
echo 4. Exit
echo.
set /p choice="Select an option (1-4): "

if "%choice%"=="1" goto install
if "%choice%"=="2" goto start
if "%choice%"=="3" goto reset
if "%choice%"=="4" goto exit
echo Invalid choice, please try again.
pause
goto menu

:install
echo.
echo Installing StitcheSense Server...
python install.py
echo.
pause
goto menu

:start
echo.
echo Starting StitcheSense Server...
python start.py
echo.
pause
goto menu

:reset
echo.
echo Resetting StitcheSense Database...
python reset.py
echo.
pause
goto menu

:exit
echo.
echo Goodbye!
pause
exit
