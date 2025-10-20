Param()

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -LiteralPath $MyInvocation.MyCommand.Path
$OpsDir = Split-Path -Parent $ScriptDir

Set-Location $OpsDir

docker compose -f docker-compose.prod.yml up -d --build

docker compose -f docker-compose.prod.yml ps
