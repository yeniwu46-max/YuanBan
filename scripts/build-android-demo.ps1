param(
    [Parameter(Mandatory = $true)][string]$WebDist,
    [string]$SdkRoot = "$env:LOCALAPPDATA\Android\Sdk",
    [string]$BuildToolsVersion = '36.0.0',
    [string]$Platform = 'android-36',
    [string]$OutputPath
)
$ErrorActionPreference = 'Stop'
$apkRepo = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$apkSource = Join-Path $apkRepo 'apps\android'
$apkWebDist = (Resolve-Path -LiteralPath $WebDist).Path
if (!(Test-Path -LiteralPath (Join-Path $apkWebDist 'index.html'))) { throw 'WebDist must contain a built H5 index.html.' }
if (!$OutputPath) { $OutputPath = Join-Path $apkRepo 'output\apk\yuanbanban-jade-demo.apk' }
$apkOutput = [IO.Path]::GetFullPath($OutputPath)
$apkTools = Join-Path $SdkRoot "build-tools\$BuildToolsVersion"
$apkPlatformJar = Join-Path $SdkRoot "platforms\$Platform\android.jar"
$apkJavaBin = Split-Path (Get-Command java.exe -ErrorAction Stop).Source
foreach ($apkRequired in @('aapt2.exe', 'zipalign.exe', 'apksigner.bat', 'd8.bat')) {
    if (!(Test-Path -LiteralPath (Join-Path $apkTools $apkRequired))) { throw "Missing SDK tool: $apkRequired" }
}
if (!(Test-Path -LiteralPath $apkPlatformJar)) { throw "Missing SDK platform: $apkPlatformJar" }
$env:JAVA_HOME = Split-Path $apkJavaBin
$apkBuild = Join-Path $apkSource ("build\" + [Guid]::NewGuid().ToString('N'))
$apkLocal = Join-Path $apkSource '.local'
$apkRes = Join-Path $apkBuild 'res'
$apkClasses = Join-Path $apkBuild 'classes'
$apkDex = Join-Path $apkBuild 'dex'
New-Item -ItemType Directory -Force -Path "$apkRes\drawable-nodpi", $apkClasses, $apkDex, $apkLocal, (Split-Path $apkOutput) | Out-Null
Copy-Item -LiteralPath (Join-Path $apkRepo 'apps\mobile\src\assets\mascot-3d\avatar.png') -Destination "$apkRes\drawable-nodpi\brand_logo.png"

function Invoke-ApkTool([string]$Tool, [string[]]$Arguments) {
    & $Tool @Arguments
    if ($LASTEXITCODE -ne 0) { throw "Tool failed ($LASTEXITCODE): $Tool" }
}
Invoke-ApkTool "$apkTools\aapt2.exe" @('compile', '--dir', $apkRes, '-o', "$apkBuild\resources.zip")
Invoke-ApkTool "$apkTools\aapt2.exe" @('link', '-I', $apkPlatformJar, '--manifest', "$apkSource\AndroidManifest.xml", '-R', "$apkBuild\resources.zip", '-A', $apkWebDist, '-o', "$apkBuild\base.apk")
$apkSources = @(Get-ChildItem -LiteralPath "$apkSource\src" -Recurse -Filter '*.java' | ForEach-Object { $_.FullName })
Invoke-ApkTool "$apkJavaBin\javac.exe" (@('-encoding', 'UTF-8', '-source', '8', '-target', '8', '-classpath', $apkPlatformJar, '-d', $apkClasses) + $apkSources)
$apkClassFiles = @(Get-ChildItem -LiteralPath $apkClasses -Recurse -Filter '*.class' | ForEach-Object { $_.FullName })
Invoke-ApkTool "$apkTools\d8.bat" (@('--lib', $apkPlatformJar, '--min-api', '26', '--output', $apkDex) + $apkClassFiles)

# Update the ZIP using its Android-required assets prefix; no source files are rewritten.
Add-Type -AssemblyName System.IO.Compression.FileSystem
$apkArchive = [IO.Compression.ZipFile]::Open("$apkBuild\base.apk", [IO.Compression.ZipArchiveMode]::Update)
try {
    # aapt2 assets use their WebDist-relative paths. Put them under www for the HTTPS handler.
    $apkEntries = @($apkArchive.Entries | Where-Object { $_.FullName.StartsWith('assets/') })
    foreach ($apkEntry in $apkEntries) {
        # Windows aapt2 may emit backslashes inside asset names. Android AssetManager
        # requires slash-separated ZIP paths, including all nested JS/CSS resources.
        $apkAssetName = $apkEntry.FullName.Substring(7).Replace('\', '/')
        $apkNewEntry = $apkArchive.CreateEntry('assets/www/' + $apkAssetName)
        $apkInput = $apkEntry.Open()
        $apkDest = $apkNewEntry.Open()
        try { $apkInput.CopyTo($apkDest) } finally { $apkDest.Dispose(); $apkInput.Dispose() }
        $apkEntry.Delete()
    }
    [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($apkArchive, "$apkDex\classes.dex", 'classes.dex') | Out-Null
} finally { $apkArchive.Dispose() }
$apkVerifyArchive = [IO.Compression.ZipFile]::OpenRead("$apkBuild\base.apk")
try {
    foreach ($apkWebFile in (Get-ChildItem -LiteralPath $apkWebDist -Recurse -File)) {
        $apkAssetPath = 'assets/www/' + $apkWebFile.FullName.Substring($apkWebDist.Length + 1).Replace('\', '/')
        if ($null -eq $apkVerifyArchive.GetEntry($apkAssetPath)) { throw "Missing bundled web asset: $apkAssetPath" }
    }
} finally { $apkVerifyArchive.Dispose() }
Invoke-ApkTool "$apkTools\zipalign.exe" @('-f', '4', "$apkBuild\base.apk", "$apkBuild\aligned.apk")
$apkKey = Join-Path $apkLocal 'demo.keystore'
if (!(Test-Path -LiteralPath $apkKey)) {
    Invoke-ApkTool "$apkJavaBin\keytool.exe" @('-genkeypair', '-keystore', $apkKey, '-storepass', 'android', '-keypass', 'android', '-alias', 'yuanbanban-demo', '-keyalg', 'RSA', '-keysize', '2048', '-validity', '10000', '-dname', 'CN=YuanBanBan Demo, O=YuanBanBan, C=CN')
}
Invoke-ApkTool "$apkTools\apksigner.bat" @('sign', '--ks', $apkKey, '--ks-key-alias', 'yuanbanban-demo', '--ks-pass', 'pass:android', '--key-pass', 'pass:android', '--out', $apkOutput, "$apkBuild\aligned.apk")
Invoke-ApkTool "$apkTools\apksigner.bat" @('verify', '--verbose', $apkOutput)
Invoke-ApkTool "$apkTools\zipalign.exe" @('-c', '4', $apkOutput)
Get-Item -LiteralPath $apkOutput | Select-Object FullName, Length
Get-FileHash -LiteralPath $apkOutput -Algorithm SHA256
