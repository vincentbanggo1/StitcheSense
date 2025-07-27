# StitcheSense Server Management Script for PowerShell

function Show-Menu {
    Clear-Host
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║                                                      ║" -ForegroundColor Cyan
    Write-Host "║              StitcheSense Server Manager             ║" -ForegroundColor Cyan
    Write-Host "║                                                      ║" -ForegroundColor Cyan
    Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. 🔧 Install Dependencies" -ForegroundColor Green
    Write-Host "2. 🚀 Start Server" -ForegroundColor Blue
    Write-Host "3. 🔄 Reset Database" -ForegroundColor Yellow
    Write-Host "4. 📊 Check Status" -ForegroundColor Magenta
    Write-Host "5. ❌ Exit" -ForegroundColor Red
    Write-Host ""
}

function Install-Dependencies {
    Write-Host "🔧 Installing StitcheSense Server Dependencies..." -ForegroundColor Green
    python install.py
    Write-Host ""
    Write-Host "Press any key to continue..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Start-Server {
    Write-Host "🚀 Starting StitcheSense Server..." -ForegroundColor Blue
    python start.py
    Write-Host ""
    Write-Host "Press any key to continue..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Reset-Database {
    Write-Host "🔄 Resetting StitcheSense Database..." -ForegroundColor Yellow
    Write-Host "⚠️  WARNING: This will delete ALL existing data!" -ForegroundColor Red
    $confirmation = Read-Host "Are you sure you want to continue? (y/N)"
    if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
        python reset.py
    } else {
        Write-Host "Reset cancelled." -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "Press any key to continue..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Check-Status {
    Write-Host "📊 Checking StitcheSense Server Status..." -ForegroundColor Magenta
    Write-Host ""
    
    # Check Python version
    Write-Host "Python Version:" -ForegroundColor Yellow
    python --version
    
    # Check if MongoDB is running
    Write-Host ""
    Write-Host "MongoDB Status:" -ForegroundColor Yellow
    try {
        $result = python -c "import pymongo; client = pymongo.MongoClient('mongodb://localhost:27017', serverSelectionTimeoutMS=2000); client.admin.command('ping'); print('✅ MongoDB is running')"
        Write-Host $result -ForegroundColor Green
    } catch {
        Write-Host "❌ MongoDB is not running or not accessible" -ForegroundColor Red
    }
    
    # Check if server is running
    Write-Host ""
    Write-Host "Server Status:" -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -Method GET -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Server is running on http://localhost:8000" -ForegroundColor Green
        }
    } catch {
        Write-Host "❌ Server is not running" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "Press any key to continue..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# Main loop
do {
    Show-Menu
    $choice = Read-Host "Select an option (1-5)"
    
    switch ($choice) {
        "1" { Install-Dependencies }
        "2" { Start-Server }
        "3" { Reset-Database }
        "4" { Check-Status }
        "5" { 
            Write-Host ""
            Write-Host "👋 Goodbye!" -ForegroundColor Green
            exit 
        }
        default { 
            Write-Host "Invalid choice, please try again." -ForegroundColor Red
            Start-Sleep -Seconds 2
        }
    }
} while ($true)
