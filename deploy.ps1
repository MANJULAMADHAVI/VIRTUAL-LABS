#!/usr/bin/env powershell
# JNTUA Labs - Production Deployment Script
# This script guides you through deploying to Vercel, Render, and Railway

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "JNTUA Labs - Production Deployment" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Prerequisites Check
Write-Host "[Step 1] Checking Prerequisites..." -ForegroundColor Yellow
$prereqs = @(
    @{Name="Git"; Command="git --version"},
    @{Name="Node.js"; Command="node --version"},
    @{Name="npm"; Command="npm --version"}
)

foreach($prereq in $prereqs) {
    try {
        $result = & $prereq.Command 2>&1
        Write-Host "✓ $($prereq.Name): $result" -ForegroundColor Green
    } catch {
        Write-Host "✗ $($prereq.Name) not found!" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "[Step 2] Deployment Platform Selection" -ForegroundColor Yellow
Write-Host ""
Write-Host "Choose deployment option:" -ForegroundColor Cyan
Write-Host "1. Full Cloud Deployment (Vercel + Render + Railway)"
Write-Host "2. Backend Only (Render + Railway)"
Write-Host "3. Frontend Only (Vercel)"
Write-Host "4. Local Testing Only"
Write-Host ""

$option = Read-Host "Enter option (1-4)"

if($option -eq "4") {
    Write-Host ""
    Write-Host "Starting local testing..." -ForegroundColor Green
    
    # Test local database
    Write-Host ""
    Write-Host "Testing database connection..." -ForegroundColor Yellow
    Write-Host "Make sure MySQL is running on localhost:3306"
    
    # Start backend
    Set-Location "backend"
    Write-Host ""
    Write-Host "Starting backend server..." -ForegroundColor Green
    npm install
    npm start
    exit
}

# Full deployment process
Write-Host ""
Write-Host "[Step 3] GitHub Setup" -ForegroundColor Yellow
Write-Host "Pushing code to GitHub..." -ForegroundColor Cyan
Write-Host ""

$gitRepo = Read-Host "Enter your GitHub username (or leave blank to skip)"
if($gitRepo) {
    git add .
    git commit -m "Prepare for production deployment"
    Write-Host "Git commands prepared. Push to GitHub manually." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[Step 4] Environment Variables" -ForegroundColor Yellow
Write-Host "You will need these values from external services:" -ForegroundColor Cyan
Write-Host ""
Write-Host "From Judge0 (RapidAPI):" -ForegroundColor Green
Write-Host "  - X-RapidAPI-Key: ________________________________________"
Write-Host ""
Write-Host "From OpenAI:" -ForegroundColor Green
Write-Host "  - API Key: ________________________________________"
Write-Host ""
Write-Host "For Database (Railway):" -ForegroundColor Green
Write-Host "  - MYSQL_HOSTNAME: ________________________________________"
Write-Host "  - MYSQL_USER: ________________________________________"
Write-Host "  - MYSQL_PASSWORD: ________________________________________"
Write-Host ""

Write-Host "[Step 5] Deployment Checklist" -ForegroundColor Yellow
Write-Host ""
Write-Host "Please complete these steps manually:" -ForegroundColor Cyan
Write-Host ""
Write-Host "RAILWAY (Database):" -ForegroundColor Magenta
Write-Host "  1. Go to https://railway.app"
Write-Host "  2. Sign in with GitHub"
Write-Host "  3. Create new project"
Write-Host "  4. Add MySQL database"
Write-Host "  5. Create database 'jntua_labs'"
Write-Host "  6. Note credentials for next step"
Write-Host ""

Write-Host "RENDER (Backend API):" -ForegroundColor Magenta
Write-Host "  1. Go to https://render.com"
Write-Host "  2. Sign in with GitHub"
Write-Host "  3. Create new Web Service"
Write-Host "  4. Select 'jntua-labs-backend' repository"
Write-Host "  5. Set environment variables"
Write-Host "  6. Deploy"
Write-Host ""

Write-Host "VERCEL (Frontend):" -ForegroundColor Magenta
Write-Host "  1. Go to https://vercel.com"
Write-Host "  2. Sign in with GitHub"
Write-Host "  3. Import 'jntua-labs-frontend' project"
Write-Host "  4. Set environment variables"
Write-Host "  5. Deploy"
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "See DEPLOYMENT_GUIDE.md for detailed instructions" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
