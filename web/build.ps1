# Build all 9 web projects (7 Next.js + 2 dx-www) and publish their static
# outputs to the assets/web folder, replacing old outputs.
#
# Usage:
#   pwsh -File web\build.ps1                 # build all + copy to G:\Dx\assets\web
#   pwsh -File web\build.ps1 -SkipBuild      # only copy existing outputs
#   pwsh -File web\build.ps1 -Target C:\web  # custom assets root
param(
    [switch]$SkipBuild,
    [string]$Target = "G:\Dx\assets\web"
)

$ErrorActionPreference = "Stop"
$webRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

# tool-id -> published folder name (must match web_preview::project_dir_name)
$projects = [ordered]@{
    "3D"            = "3d"
    "Design"        = "Design"
    "Graphics"      = "Graphics"
    "Music"         = "Music"
    "Presentations" = "Presentations"
    "Spreadsheets"  = "Spreadsheets"
    "Video"         = "Video"
    "Whiteboard"    = "whiteboard"
    "Shader"        = "shader"
}

# tool-id -> source build output directory (relative to project folder)
$outputDirs = @{
    "3D"            = "out"
    "Design"        = "out"
    "Graphics"      = "out"
    "Music"         = "out"
    "Presentations" = "out"
    "Spreadsheets"  = "out"
    "Video"         = "out"
    "Whiteboard"    = ".dx\www\output"
    "Shader"        = ".dx\www\output"
}

$projectsRoot = $webRoot
$targetRoot = $Target

function Invoke-Build([string]$name, [string]$dir, [string[]]$command) {
    Write-Host ""
    Write-Host "=== Building $name ($($command -join ' ')) ===" -ForegroundColor Cyan
    Push-Location $dir
    try {
        & $command[0] @($command[1..($command.Length - 1)])
        if ($LASTEXITCODE -ne 0) {
            throw "$name build failed with exit code $LASTEXITCODE"
        }
    } finally {
        Pop-Location
    }
}

function Invoke-Install([string]$name, [string]$dir) {
    Write-Host ""
    Write-Host "=== Installing deps $name (npm.cmd install) ===" -ForegroundColor Cyan
    Push-Location $dir
    try {
        & npm.cmd install
        if ($LASTEXITCODE -ne 0) {
            throw "$name install failed with exit code $LASTEXITCODE"
        }
    } finally {
        Pop-Location
    }
}

if (-not $SkipBuild) {
    foreach ($name in $projects.Keys) {
        $projDir = Join-Path $projectsRoot $name
        if (-not (Test-Path -LiteralPath $projDir)) {
            Write-Warning "Project dir not found: $projDir (skipping)"
            continue
        }
        if ($outputDirs[$name] -eq "out") {
            if (-not (Test-Path -LiteralPath (Join-Path $projDir "node_modules"))) {
                Invoke-Install $name $projDir
            }
            Invoke-Build $name $projDir @("npm.cmd", "run", "build")
        } else {
            Invoke-Build $name $projDir @("dx", "build")
        }
    }
}

Write-Host ""
Write-Host "=== Publishing outputs to $targetRoot ===" -ForegroundColor Cyan
New-Item -ItemType Directory -Path $targetRoot -Force | Out-Null

foreach ($name in $projects.Keys) {
    $projDir = Join-Path $projectsRoot $name
    $src = Join-Path $projDir $outputDirs[$name]
    $dst = Join-Path $targetRoot $projects[$name]

    if (-not (Test-Path -LiteralPath $src)) {
        Write-Warning "Output not found: $src (skipping $name)"
        continue
    }
    if (-not (Test-Path -LiteralPath (Join-Path $src "index.html"))) {
        Write-Warning "No index.html in $src (skipping $name)"
        continue
    }

    Write-Host "Publishing $name -> $dst"
    if (Test-Path -LiteralPath $dst) {
        Remove-Item -LiteralPath $dst -Recurse -Force
    }
    New-Item -ItemType Directory -Path $dst -Force | Out-Null
    Copy-Item -Path (Join-Path $src "*") -Destination $dst -Recurse -Force
}

Write-Host ""
Write-Host "Build complete. Outputs published to $targetRoot" -ForegroundColor Green
