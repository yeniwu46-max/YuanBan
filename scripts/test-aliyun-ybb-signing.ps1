$ErrorActionPreference = 'Stop'
$ybbTestSource = Join-Path $PSScriptRoot 'aliyun-ybb.ps1'
$ybbTokens = $null
$ybbParseErrors = $null
$ybbAst = [Management.Automation.Language.Parser]::ParseFile($ybbTestSource, [ref]$ybbTokens, [ref]$ybbParseErrors)
if ($ybbParseErrors.Count) { throw 'PowerShell parse failed.' }
$ybbFunction = $ybbAst.Find({ param($node) $node -is [Management.Automation.Language.FunctionDefinitionAst] -and $node.Name -eq 'Invoke-YbbRpc' }, $true)
. ([scriptblock]::Create($ybbFunction.Extent.Text))
$ybbCredentials = @{ALIYUN_ACCESS_KEY_ID='testid';ALIYUN_ACCESS_KEY_SECRET='test-secret'}
$ybbRegion = 'cn-shanghai'
function Invoke-RestMethod { param($Uri, $Method, $Body, $TimeoutSec) return $Body }
$ybbBody = Invoke-YbbRpc 'alidns' 'AddDomainRecord' @{DomainName='wuyeni.cn';RR='ybb';Type='A';Value='106.15.77.40';TTL='600'}
# Explicit RFC3986/ASCII key order, independently specified rather than using the production sorter.
$ybbExpectedKeys = 'AccessKeyId','Action','DomainName','Format','RR','SignatureMethod','SignatureNonce','SignatureVersion','TTL','Timestamp','Type','Value','Version'
$ybbExpectedQuery = ($ybbExpectedKeys | ForEach-Object { $_ + '=' + [Uri]::EscapeDataString($ybbBody[$_]) }) -join '&'
$ybbTestMac = [Security.Cryptography.HMACSHA1]::new([Text.Encoding]::UTF8.GetBytes('test-secret&'))
try { $ybbExpectedSignature = [Convert]::ToBase64String($ybbTestMac.ComputeHash([Text.Encoding]::UTF8.GetBytes('POST&%2F&' + [Uri]::EscapeDataString($ybbExpectedQuery)))) } finally { $ybbTestMac.Dispose() }
if ($ybbBody.Signature -cne $ybbExpectedSignature) { throw 'RPC signing regression: TTL must precede Timestamp using ordinal ASCII order.' }
Write-Output 'PASS: AddDomainRecord signature uses ordinal ordering (TTL before Timestamp), no network or real credentials used.'
