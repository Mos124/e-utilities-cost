# ===================================================
#  build-push.ps1  –  Build & Push to Docker Hub
#  Usage: .\build-push.ps1
# ===================================================
$DOCKER_USER = "mos124"
$APP_NAME    = "e-utilities"
$TAG         = "latest"

Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "  Building e-utilities-cost images  " -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

# ── Backend ──────────────────────────────────────
Write-Host "[1/4] Building backend image..." -ForegroundColor Yellow
docker build -t "${DOCKER_USER}/${APP_NAME}-backend:${TAG}" ./backend
if ($LASTEXITCODE -ne 0) { Write-Host "Backend build FAILED" -ForegroundColor Red; exit 1 }
Write-Host "Backend image built: ${DOCKER_USER}/${APP_NAME}-backend:${TAG}`n" -ForegroundColor Green

# ── Frontend ─────────────────────────────────────
Write-Host "[2/4] Building frontend image..." -ForegroundColor Yellow
docker build -t "${DOCKER_USER}/${APP_NAME}-frontend:${TAG}" ./frontend
if ($LASTEXITCODE -ne 0) { Write-Host "Frontend build FAILED" -ForegroundColor Red; exit 1 }
Write-Host "Frontend image built: ${DOCKER_USER}/${APP_NAME}-frontend:${TAG}`n" -ForegroundColor Green

# ── Push Backend ──────────────────────────────────
Write-Host "[3/4] Pushing backend to Docker Hub..." -ForegroundColor Yellow
docker push "${DOCKER_USER}/${APP_NAME}-backend:${TAG}"
if ($LASTEXITCODE -ne 0) { Write-Host "Backend push FAILED" -ForegroundColor Red; exit 1 }
Write-Host "Backend pushed successfully!`n" -ForegroundColor Green

# ── Push Frontend ─────────────────────────────────
Write-Host "[4/4] Pushing frontend to Docker Hub..." -ForegroundColor Yellow
docker push "${DOCKER_USER}/${APP_NAME}-frontend:${TAG}"
if ($LASTEXITCODE -ne 0) { Write-Host "Frontend push FAILED" -ForegroundColor Red; exit 1 }
Write-Host "Frontend pushed successfully!`n" -ForegroundColor Green

Write-Host "======================================" -ForegroundColor Cyan
Write-Host " All images pushed to Docker Hub!" -ForegroundColor Green
Write-Host "  Backend  : docker pull ${DOCKER_USER}/${APP_NAME}-backend:${TAG}" -ForegroundColor White
Write-Host "  Frontend : docker pull ${DOCKER_USER}/${APP_NAME}-frontend:${TAG}" -ForegroundColor White
Write-Host "======================================`n" -ForegroundColor Cyan
