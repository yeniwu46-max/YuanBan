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
        $apkNode = $apkUi.SelectNodes('//node') | Where-Object { ([string]$_.text).Trim() -eq $Text -or $_.GetAttribute('content-desc').Trim() -eq $Text -or ($_.class -eq 'android.widget.Button' -and ([string]$_.text).Trim().StartsWith($Text + ' ')) } | Select-Object -First 1
        if ($apkNode -and $apkNode.bounds -match '^\[(\d+),(\d+)\]\[(\d+),(\d+)\]$' -and [int]$Matches[4] -gt [int]$Matches[2]) { return $apkNode }
        if ($apkAttempt -ge 1) {
            # WebView exposes off-screen buttons with zero-height bounds. Scroll into view before tapping.
            & $Adb -s $Serial shell input swipe 540 1750 540 800 350
        }
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
    Tap-DemoText '登录并继续'
}
function Assert-ForestProcess {
    $forestPid = (& $Adb -s $Serial shell pidof cn.yuanbanban.demo).Trim()
    $forestErrors = & $Adb -s $Serial logcat -d "--pid=$forestPid" -s YuanBanWeb:E AndroidRuntime:E
    if ($forestErrors -match 'E YuanBanWeb|E AndroidRuntime') { throw ($forestErrors -join "`n") }
}

if ($Roles -contains 'elder') {
    Open-DemoRole '我是老人'
    Tap-DemoText '保存信息 ›'
    Tap-DemoText '完成绑定 ✓'
    Tap-DemoText '进入首页'
    Find-DemoText '今天，也安心相伴。' | Out-Null
    Save-DemoScreen 'yuanbanban-forest-android-home'
    Tap-DemoText '紧急求助'
    Tap-DemoText '误触了，取消'
    Find-DemoText '已取消本次操作' | Out-Null
    Tap-DemoText '首页'
    Tap-DemoText '健康'
    Find-DemoText '我的身体' | Out-Null
    Tap-DemoText '首页'
    Find-DemoText '今天，也安心相伴。' | Out-Null
    Assert-ForestProcess
    Write-Output 'PASS: elder cold start, forest home, health, SOS cancel and return'
}

if ($Roles -contains 'family') {
    Open-DemoRole '我是家人'
    Tap-DemoText '继续 ›'
    Tap-DemoText '进入守护首页 ⌂'
    Find-DemoText '切换守护对象' | Out-Null
    Save-DemoScreen 'yuanbanban-forest-android-family'
    Tap-DemoText '切换守护对象'
    Find-DemoText '选择要守护的长辈' | Out-Null
    Save-DemoScreen 'yuanbanban-forest-android-sheet'
    & $Adb -s $Serial shell input keyevent 4
    Find-DemoText '切换守护对象' | Out-Null
    $apkAfterBack = Get-DemoUi
    if ($apkAfterBack.SelectNodes('//node') | Where-Object { $_.text -eq '选择要守护的长辈' }) { throw 'Back key did not dismiss sheet.' }
    Tap-DemoText '报告'
    Find-DemoText '周报' | Out-Null
    Assert-ForestProcess
    Write-Output 'PASS: family login, guardian home, sheet, native back and report navigation'
}

if ($Roles -contains 'community') {
    Open-DemoRole '我是社区人员'
    Tap-DemoText '保存信息 ›'
    Tap-DemoText '进入服务工作台 ⌂'
    Find-DemoText '社区端 · 服务工作台' | Out-Null
    Save-DemoScreen 'yuanbanban-forest-android-community'
    Tap-DemoText '工单'
    Find-DemoText '把每一份需要，及时接住。' | Out-Null
    Assert-ForestProcess
    Write-Output 'PASS: community cold start, dashboard and workorder navigation'
}

$apkTestPid = (& $Adb -s $Serial shell pidof cn.yuanbanban.demo).Trim()
$apkErrorLog = & $Adb -s $Serial logcat -d "--pid=$apkTestPid" -s YuanBanWeb:E AndroidRuntime:E
$apkErrorLog
if ($apkErrorLog -match 'E YuanBanWeb|E AndroidRuntime') { throw 'Current app process reported a WebView or runtime error.' }
