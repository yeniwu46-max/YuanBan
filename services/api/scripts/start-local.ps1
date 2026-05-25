# 无 Docker 本地启动 API（SQLite，无需 Postgres/Redis/EMQX）
Set-Location $PSScriptRoot\..
pip install -e . -q
python -m app.dev_setup
Write-Host ""
Write-Host "Starting API at http://localhost:8000" -ForegroundColor Green
Write-Host "Health: http://localhost:8000/health" -ForegroundColor Green
Write-Host "Docs:   http://localhost:8000/docs" -ForegroundColor Green
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
