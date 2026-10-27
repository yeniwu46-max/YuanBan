param(
    [string]$Serial = 'emulator-5580',
    [string]$Adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe",
    [ValidateSet('elder', 'family', 'community')][string[]]$Roles = @('elder', 'family', 'community')
)
$ErrorActionPreference = 'Stop'
$apkTestRepo = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$apkTestOutput = Join-Path $apkTestRepo 'output\apk'

function Get-DemoUi {
    & $Adb -s $Serial shell uiautomator dump /sdcard/yuanbanban-ui.xml | Out-Null
    $apkUiText = (& $Adb -s $Serial shell cat /sdcard/yuanbanban-ui.xml) -join "`n"
    return [xml]$apkUiText
}
function Find-DemoText([string]$Text) {
    for ($apkAttempt = 0; $apkAttempt -lt 6; $apkAttempt++) {
        $apkUi = Get-DemoUi
        $apkNode = $apkUi.SelectNodes('//node') | Where-Object { $_.text -eq $Text -or $_.GetAttribute('content-desc') -eq $Text } | Select-Object -First 1
        if ($apkNode) { return $apkNode }
        Start-Sleep -Milliseconds 500
    }
    throw "UI text not found: $Text"
}
function Tap-DemoText([string]$Text) {
    $apkNode = Find-DemoText $Text
    if ($apkNode.bounds -notmatch '^\[(\d+),(\d+)\]\[(\d+),(\d+)\]$') { throw "Invalid node bounds: $Text" }
    $apkTapX = [int](([int]$Matches[1] + [int]$Matches[3]) / 2)
    $apkTapY = [int](([int]$Matches[2] + [int]$Matches[4]) / 2)
    & $Adb -s $Serial shell input tap $apkTapX $apkTapY
}
function Save-DemoScreen([string]$Name) {
    & $Adb -s $Serial shell screencap -p "/sdcard/$Name.png"
    & $Adb -s $Serial pull "/sdcard/$Name.png" "$apkTestOutput\$Name.png"
}
function Open-DemoRole([string]$Role) {
    & $Adb -s $Serial shell am force-stop cn.yuanbanban.demo
    & $Adb -s $Serial shell am start -W -n cn.yuanbanban.demo/.MainActivity | Out-Null
    Tap-DemoText '开始使用 ›'
    Tap-DemoText $Role
    Tap-DemoText '登录并继续 ›'
}

if ($Roles -contains 'elder') {
    Open-DemoRole '我是老人'
    Tap-DemoText '保存信息 ›'
    Tap-DemoText '完成绑定 ✓'
    Tap-DemoText '进入首页'
    Find-DemoText '守护在身边' | Out-Null
    Save-DemoScreen 'yuanbanban-android-home'
    Tap-DemoText '健康'
    Find-DemoText '我的身体' | Out-Null
    Tap-DemoText '首页'
    Find-DemoText '守护在身边' | Out-Null
    Write-Output 'PASS: elder login, jade home, health and return'
}

if ($Roles -contains 'family') {
    Open-DemoRole '我是家人'
    Tap-DemoText '继续 ›'
    Tap-DemoText '进入守护首页 ⌂'
    Find-DemoText '快捷关怀' | Out-Null
    Save-DemoScreen 'yuanbanban-android-family'
    Write-Output 'PASS: family login and guardian home'
}

if ($Roles -contains 'community') {
    Open-DemoRole '我是社区人员'
    Tap-DemoText '保存信息 ›'
    Tap-DemoText '进入服务工作台 ⌂'
    Find-DemoText '社区端 · 服务工作台' | Out-Null
    Save-DemoScreen 'yuanbanban-android-community'
    Write-Output 'PASS: community login and dashboard'
}

$apkTestPid = (& $Adb -s $Serial shell pidof cn.yuanbanban.demo).Trim()
$apkErrorLog = & $Adb -s $Serial logcat -d "--pid=$apkTestPid" -s YuanBanWeb:E AndroidRuntime:E
$apkErrorLog
if ($apkErrorLog -match 'E YuanBanWeb|E AndroidRuntime') { throw 'Current app process reported a WebView or runtime error.' }
