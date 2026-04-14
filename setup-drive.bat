@echo off
echo ============================================
echo  Kaviraj Portfolio - Google Drive Setup
echo ============================================
echo.
echo This script will help you set up Google Drive integration.
echo.
echo Prerequisites:
echo 1. Google Cloud Console account
echo 2. Google Drive folder access
echo.
echo Steps to complete:
echo.
echo 1. Go to: https://console.cloud.google.com/
echo 2. Create/select a project
echo 3. Enable Google Drive API
echo 4. Create a Service Account with Editor role
echo 5. Download JSON key as 'credentials.json'
echo 6. Place credentials.json in this folder
echo 7. Share your Drive folder with the service account email
echo.
echo Your Google Drive folder: https://drive.google.com/drive/folders/1gRDgoO11jtwfMKGFu-wgS9Pvx6sXurV0
echo.
echo Template credentials file: credentials-template.json
echo.
pause
echo.
echo Checking for Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ Node.js not found!
    echo.
    echo Please install Node.js first:
    echo 1. Go to: https://nodejs.org/
    echo 2. Download the LTS version
    echo 3. Install it (this includes npm)
    echo 4. Restart this script
    echo.
    echo After installing Node.js, run this script again.
    pause
    exit /b 1
) else (
    echo ✓ Node.js found!
    echo.
    echo Checking for credentials.json...
    if exist "credentials.json" (
        echo ✓ credentials.json found!
        echo.
        echo Installing dependencies...
        npm install
        if %errorlevel% neq 0 (
            echo ✗ Failed to install dependencies!
            echo Please check your internet connection and try again.
            pause
            exit /b 1
        )
        echo.
        echo ✓ Dependencies installed successfully!
        echo.
        echo Starting server...
        echo.
        echo The server will start on http://localhost:3000
        echo Press Ctrl+C to stop the server
        echo.
        npm start
    ) else (
        echo ✗ credentials.json not found!
        echo.
        echo Please follow these steps to create Google Drive credentials:
        echo.
        echo 1. Go to Google Cloud Console: https://console.cloud.google.com/
        echo 2. Create/select a project
        echo 3. Enable Google Drive API
        echo 4. Create Service Account with Editor role
        echo 5. Download JSON key and save as 'credentials.json'
        echo 6. Share your Drive folder with the service account email
        echo.
        echo Your Drive folder: https://drive.google.com/drive/folders/1gRDgoO11jtwfMKGFu-wgS9Pvx6sXurV0
        echo.
        echo Once you have credentials.json, run this script again.
        echo.
        echo For now, you can test with the static version:
        echo - Open static.html in your browser
        echo.
        pause
    )
)