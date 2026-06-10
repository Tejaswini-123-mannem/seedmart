# enable-replica-set.ps1
# ----------------------------------------------------------------------------
# Converts the LOCAL MongoDB 7.0 standalone into a single-node replica set
# named "rs0", so multi-document transactions work locally (parity with Atlas).
#
# WHY: MongoDB transactions require a replica set (they need the oplog /
# rollback machinery a standalone doesn't have). A 1-node replica set has that
# machinery without needing extra servers. Your existing data is preserved.
#
# RUN THIS AS ADMINISTRATOR (it edits a Program Files config + restarts a
# Windows service, both of which require elevation):
#   1. Start menu -> type "PowerShell" -> right-click -> "Run as administrator"
#   2. Paste:
#      powershell -ExecutionPolicy Bypass -File "C:\Users\manne\OneDrive\Desktop\seedmart\server\scripts\enable-replica-set.ps1"
# ----------------------------------------------------------------------------

$ErrorActionPreference = 'Stop'

$cfg     = 'C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg'
$mongosh = 'C:\Program Files\MongoDB\Server\7.0\bin\mongosh.exe'

# Refuse to run unelevated — the edit + service restart would fail midway.
$me = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $me.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Error 'This script must be run from an ELEVATED (Administrator) PowerShell.'
    exit 1
}

Write-Host '1/5  Backing up mongod.cfg -> mongod.cfg.bak'
Copy-Item $cfg "$cfg.bak" -Force

Write-Host '2/5  Enabling replication (replSetName: rs0) in the config'
$content = Get-Content $cfg -Raw
if ($content -match '(?m)^\s*replSetName\s*:') {
    Write-Host '     replSetName already set, leaving config as-is.'
}
elseif ($content -match '(?m)^#replication:\s*$') {
    # Replace the commented placeholder with a real replication block.
    $content = $content -replace '(?m)^#replication:\s*$', "replication:`r`n  replSetName: rs0"
    Set-Content -Path $cfg -Value $content -Encoding ascii
}
else {
    # No placeholder found — append a fresh block at the end.
    $content = $content.TrimEnd() + "`r`n`r`nreplication:`r`n  replSetName: rs0`r`n"
    Set-Content -Path $cfg -Value $content -Encoding ascii
}

Write-Host '3/5  Restarting the MongoDB service'
Restart-Service MongoDB

# Give mongod a moment to come back up before we talk to it.
$up = $false
for ($i = 0; $i -lt 20; $i++) {
    Start-Sleep -Milliseconds 500
    try { & $mongosh --quiet --eval 'db.runCommand({ ping: 1 }).ok' | Out-Null; $up = $true; break } catch {}
}
if (-not $up) { Write-Error 'mongod did not come back up after restart.'; exit 1 }

Write-Host '4/5  Initiating the replica set (one-time; safe to re-run)'
# rs.status() throws (NotYetInitialized) until initiated. Bind the member to
# 127.0.0.1:27017 so it matches the app''s MONGO_URI host exactly.
$initJs = @'
try {
  rs.status();
  print("Replica set already initialized.");
} catch (e) {
  rs.initiate({ _id: "rs0", members: [{ _id: 0, host: "127.0.0.1:27017" }] });
  print("Replica set initiated.");
}
'@
& $mongosh --quiet --eval $initJs

Write-Host '5/5  Verifying primary is elected...'
# Wait until this node becomes PRIMARY (myState 1).
$ok = $false
for ($i = 0; $i -lt 20; $i++) {
    Start-Sleep -Milliseconds 500
    $state = (& $mongosh --quiet --eval 'rs.status().myState' ) 2>$null
    if ("$state".Trim() -eq '1') { $ok = $true; break }
}
if ($ok) {
    Write-Host ''
    Write-Host 'SUCCESS: local MongoDB is now a single-node replica set (rs0).' -ForegroundColor Green
    Write-Host 'Transactions are now supported. No app code or MONGO_URI change required.'
} else {
    Write-Warning 'Replica set did not reach PRIMARY. Check the MongoDB log or rerun.'
}
