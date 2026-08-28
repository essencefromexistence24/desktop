# Build all web projects (Next.js, Vite, pnpm-monorepo, dx-www) and publish their
# static outputs to the desktop assets/web folder, replacing old outputs.
#
# Usage:
#   pwsh -File web\build.ps1                       # build all + publish to G:\Dx\desktop\assets\web
#   pwsh -File web\build.ps1 -SkipBuild            # only copy existing outputs
#   pwsh -File web\build.ps1 -Only cms             # build + publish a single project
#   pwsh -File web\build.ps1 -Target C:\web        # custom assets root
param(
    [switch]$SkipBuild,
    [string]$Target = "G:\Dx\desktop\assets\web",
    [string]$Only
)

$ErrorActionPreference = "Stop"
$webRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

# tool-id-folder -> published folder name (must match web_preview::project_dir_name)
$projects = [ordered]@{
    "3D"            = "3d"
    "Graphics"      = "Graphics"
    "Spreadsheets"  = "Spreadsheets"
    "Video"         = "Video"
    "Whiteboard"    = "whiteboard"
    "Shader"        = "shader"
    "cms"           = "cms"
    "graph"         = "graph"
    "media"         = "media"
    "Train"         = "Train"
    "Metasearch"    = "metasearch"
    "Router"        = "router"
}

# tool-id-folder -> source build output directory (relative to project folder)
$outputDirs = @{
    "3D"            = "out"
    "Graphics"      = "out"
    "Spreadsheets"  = "out"
    "Video"         = "out"
    "Whiteboard"    = ".dx\www\output"
    "Shader"        = ".dx\www\output"
    "cms"           = "dist"
    "graph"         = "understand-anything-plugin\packages\dashboard\dist"
    "media"         = "dist"
    "Train"         = "dist"
    "Metasearch"    = ".dx\www\output"
    "Router"        = "apps\web\.next"
}

# Override the default "build" npm script per project.
$buildScripts = @{
    "media" = "vite:build"
}

$projectsRoot = $webRoot
$targetRoot = $Target

# Pick the package manager from the project's lockfile.
function Get-PackageManager([string]$dir) {
    if (Test-Path (Join-Path $dir "pnpm-lock.yaml")) { return "pnpm" }
    if (Test-Path (Join-Path $dir "package-lock.json")) { return "npm.cmd" }
    if (Test-Path (Join-Path $dir "yarn.lock")) { return "yarn" }
    if (Test-Path (Join-Path $dir "bun.lock")) { return "bun" }
    return "npm.cmd"
}

function Get-BuildScript([string]$name) {
    if ($buildScripts.ContainsKey($name)) { return $buildScripts[$name] }
    return "build"
}

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

function Invoke-Install([string]$name, [string]$dir, [string]$pm) {
    Write-Host ""
    Write-Host "=== Installing deps $name ($pm install) ===" -ForegroundColor Cyan
    Push-Location $dir
    try {
        & $pm install
        if ($LASTEXITCODE -ne 0) {
            throw "$name install failed with exit code $LASTEXITCODE"
        }
    } finally {
        Pop-Location
    }
}

if (-not $SkipBuild) {
    foreach ($name in $projects.Keys) {
        if ($Only -and $name -ne $Only) { continue }
        $projDir = Join-Path $projectsRoot $name
        if (-not (Test-Path -LiteralPath $projDir)) {
            Write-Warning "Project dir not found: $projDir (skipping)"
            continue
        }
        $outDir = $outputDirs[$name]
        $pm = Get-PackageManager $projDir
        # dx-www projects are built with `dx build` and publish to .dx\www\output.
        if ($outDir -like ".dx*") {
            Invoke-Build $name $projDir @("dx", "build")
        } else {
            if (-not (Test-Path -LiteralPath (Join-Path $projDir "node_modules"))) {
                Invoke-Install $name $projDir $pm
            }
            $scriptName = Get-BuildScript $name
            # pnpm shim misparses "pnpm run X" under PS7's @(...) splatting;
            # `pnpm X` is equivalent and works reliably.
            if ($pm -eq "pnpm") {
                Invoke-Build $name $projDir @($pm, $scriptName)
            } else {
                Invoke-Build $name $projDir @($pm, "run", $scriptName)
            }
        }
    }
}

Write-Host ""
Write-Host "=== Publishing outputs to $targetRoot ===" -ForegroundColor Cyan
New-Item -ItemType Directory -Path $targetRoot -Force | Out-Null

foreach ($name in $projects.Keys) {
    if ($Only -and $name -ne $Only) { continue }
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
