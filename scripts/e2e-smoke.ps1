#Requires -Version 5.1
$ErrorActionPreference = 'Stop'
$base = 'http://localhost:8000'

Write-Host "== health =="
$health = Invoke-RestMethod -Uri "$base/health"
if ($health.status -ne 'ok') { throw 'health failed' }

Write-Host "== auth =="
$family = Invoke-RestMethod -Method Post -Uri "$base/api/v1/auth/phone/verify" -ContentType 'application/json' -Body '{"phone":"13000000000","code":"123456","role":"family"}'
$elder = Invoke-RestMethod -Method Post -Uri "$base/api/v1/auth/phone/verify" -ContentType 'application/json' -Body '{"phone":"13800000001","code":"123456","role":"elder"}'
$community = Invoke-RestMethod -Method Post -Uri "$base/api/v1/auth/phone/verify" -ContentType 'application/json' -Body '{"phone":"13900000001","code":"123456","role":"community"}'
if (-not $family.access_token) { throw 'family token missing' }

Write-Host "== me =="
$me = Invoke-RestMethod -Uri "$base/api/v1/auth/me" -Headers @{ Authorization = "Bearer $($family.access_token)" }
if ($me.bound_elders.Count -lt 1) { throw 'family should have bound elders' }

Write-Host "== sos trigger =="
$sos = Invoke-RestMethod -Method Post -Uri "$base/api/v1/simulator/trigger" -Headers @{ Authorization = "Bearer $($elder.access_token)" } -ContentType 'application/json' -Body '{"event_type":"sos","elder_id":"elder-001","device_id":"d3","location":"卧室"}'
if (-not $sos.ok) { throw 'sos trigger failed' }

Write-Host "== alerts =="
$alerts = Invoke-RestMethod -Uri "$base/api/v1/alerts?elder_id=elder-001" -Headers @{ Authorization = "Bearer $($family.access_token)" }
if ($alerts.Count -lt 1) { throw 'alerts empty' }

Write-Host "== medicines/devices =="
$meds = Invoke-RestMethod -Uri "$base/api/v1/elders/elder-001/medicines" -Headers @{ Authorization = "Bearer $($elder.access_token)" }
$devices = Invoke-RestMethod -Uri "$base/api/v1/elders/elder-001/devices" -Headers @{ Authorization = "Bearer $($elder.access_token)" }
if ($meds.Count -lt 1 -or $devices.Count -lt 1) { throw 'detail endpoints empty' }

Write-Host "== authz 403 =="
$other = Invoke-RestMethod -Method Post -Uri "$base/api/v1/auth/phone/verify" -ContentType 'application/json' -Body '{"phone":"13000000001","code":"123456","role":"family"}'
$denied = $false
try {
  Invoke-RestMethod -Uri "$base/api/v1/elders/elder-001" -Headers @{ Authorization = "Bearer $($other.access_token)" }
} catch {
  if ($_.Exception.Response.StatusCode.value__ -eq 403) { $denied = $true }
}
if (-not $denied) { throw 'expected 403 for unbound family user' }

Write-Host "PASS: e2e smoke"
