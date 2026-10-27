param(
    [ValidateSet('Inspect', 'RunScript', 'Result', 'AddDns')][string]$Operation = 'Inspect',
    [string]$ScriptPath,
    [string]$InvokeId,
    [string]$CredentialsPath = "$env:USERPROFILE\.ssh\aliyun.env"
)
$ErrorActionPreference = 'Stop'
$ybbRegion = 'cn-shanghai'
$ybbInstance = 'i-uf6d1usviqv6z4tlvduk'
$ybbAddress = '106.15.77.40'
$ybbCredentials = Get-Content -LiteralPath $CredentialsPath -Raw | ConvertFrom-StringData

function Invoke-YbbRpc([string]$Service, [string]$Action, [hashtable]$Parameters) {
    $ybbVersion = if ($Service -eq 'alidns') { '2015-01-09' } else { '2014-05-26' }
    $ybbEndpoint = if ($Service -eq 'alidns') { 'https://alidns.aliyuncs.com' } else { "https://ecs.$ybbRegion.aliyuncs.com" }
    $ybbParams = @{ Format='JSON'; Version=$ybbVersion; Action=$Action; AccessKeyId=$ybbCredentials.ALIYUN_ACCESS_KEY_ID; SignatureMethod='HMAC-SHA1'; SignatureVersion='1.0'; SignatureNonce=[guid]::NewGuid().ToString(); Timestamp=[DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ') }
    foreach ($ybbKey in $Parameters.Keys) { $ybbParams[$ybbKey] = [string]$Parameters[$ybbKey] }
    [string[]]$ybbOrderedKeys = @($ybbParams.Keys)
    [Array]::Sort($ybbOrderedKeys, [StringComparer]::Ordinal)
    $ybbCanonical = (($ybbOrderedKeys | ForEach-Object { [Uri]::EscapeDataString($_) + '=' + [Uri]::EscapeDataString($ybbParams[$_]) }) -join '&')
    $ybbHmac = [Security.Cryptography.HMACSHA1]::new([Text.Encoding]::UTF8.GetBytes($ybbCredentials.ALIYUN_ACCESS_KEY_SECRET + '&'))
    try { $ybbParams.Signature = [Convert]::ToBase64String($ybbHmac.ComputeHash([Text.Encoding]::UTF8.GetBytes('POST&%2F&' + [Uri]::EscapeDataString($ybbCanonical)))) } finally { $ybbHmac.Dispose() }
    try { return Invoke-RestMethod -Uri $ybbEndpoint -Method Post -Body $ybbParams -TimeoutSec 30 }
    catch {
        # Never include the signed URL, request body or credential values in errors.
        try { $ybbErrorCode = ($_.ErrorDetails.Message | ConvertFrom-Json).Code } catch { $ybbErrorCode = 'RPC_REQUEST_FAILED' }
        throw "Alibaba Cloud $Action failed: $ybbErrorCode"
    }
}

switch ($Operation) {
    'Inspect' {
        Invoke-YbbRpc 'alidns' 'DescribeDomainRecords' @{DomainName='wuyeni.cn';RRKeyWord='ybb';PageSize='100'} | ConvertTo-Json -Depth 8
        $ybbInfo = Invoke-YbbRpc 'ecs' 'DescribeInstances' @{RegionId=$ybbRegion;InstanceIds="[`"$ybbInstance`"]"}
        $ybbInfo.Instances.Instance | Select-Object InstanceId, Status, OSName, PublicIpAddress | ConvertTo-Json -Depth 5
    }
    'RunScript' {
        if (!$ScriptPath) { throw 'ScriptPath is required.' }
        $ybbScript = Get-Content -LiteralPath $ScriptPath -Raw
        $ybbContent = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($ybbScript.Replace("`r`n", "`n")))
        Invoke-YbbRpc 'ecs' 'RunCommand' @{RegionId=$ybbRegion;'InstanceId.1'=$ybbInstance;Type='RunShellScript';CommandContent=$ybbContent;ContentEncoding='Base64';Timeout='120';WorkingDir='/tmp';Name='yuanbanban-ybb-deploy';KeepCommand='false'} | ConvertTo-Json -Depth 5
    }
    'Result' {
        if (!$InvokeId) { throw 'InvokeId is required.' }
        $ybbResult = Invoke-YbbRpc 'ecs' 'DescribeInvocationResults' @{RegionId=$ybbRegion;InvokeId=$InvokeId;InstanceId=$ybbInstance;ContentEncoding='Base64'}
        foreach ($ybbItem in $ybbResult.Invocation.InvocationResults.InvocationResult) {
            [pscustomobject]@{Status=$ybbItem.InvocationStatus;ExitCode=$ybbItem.ExitCode;InvokeId=$ybbItem.InvokeId;Output=[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($ybbItem.Output))} | ConvertTo-Json -Depth 4
        }
    }
    'AddDns' {
        $ybbExisting = Invoke-YbbRpc 'alidns' 'DescribeDomainRecords' @{DomainName='wuyeni.cn';RRKeyWord='ybb';PageSize='100'}
        $ybbExact = @($ybbExisting.DomainRecords.Record | Where-Object RR -EQ 'ybb')
        if ($ybbExact.Count -gt 0) {
            if (@($ybbExact | Where-Object { $_.Type -ne 'A' -or $_.Value -ne $ybbAddress -or $_.Status -ne 'ENABLE' }).Count -gt 0) { throw 'Existing ybb record conflicts; refusing to overwrite it.' }
            $ybbExact | Select-Object RecordId, RR, Type, Value, Status | ConvertTo-Json
        } else {
            Invoke-YbbRpc 'alidns' 'AddDomainRecord' @{DomainName='wuyeni.cn';RR='ybb';Type='A';Value=$ybbAddress;TTL='600'} | ConvertTo-Json
        }
    }
}
