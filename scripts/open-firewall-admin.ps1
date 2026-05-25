# Run as Administrator: right-click -> Run with PowerShell (Admin)
# Or: Start-Process powershell -Verb RunAs -ArgumentList '-File', '...\open-firewall-admin.ps1'

$ErrorActionPreference = 'Stop'

function Ensure-Rule {
  param([string]$Name, [int]$Port)
  $existing = Get-NetFirewallRule -DisplayName $Name -ErrorAction SilentlyContinue
  if ($existing) {
    Remove-NetFirewallRule -DisplayName $Name
  }
  New-NetFirewallRule -DisplayName $Name -Direction Inbound -Action Allow -Protocol TCP -LocalPort $Port -Profile Any | Out-Null
  Write-Host "OK: $Name (TCP $Port, all profiles)"
}

Ensure-Rule 'Yuanbanban API 8000' 8000
Ensure-Rule 'Yuanbanban H5 8080' 8080

try {
  Set-NetConnectionProfile -InterfaceAlias 'WLAN' -NetworkCategory Private -ErrorAction Stop
  Write-Host 'OK: WLAN set to Private network'
} catch {
  Write-Warning "Could not set WLAN to Private: $_"
}

Write-Host ''
Write-Host 'Firewall ready. Phone should use http://<PC-WLAN-IP>:8080 on the SAME WiFi.'
