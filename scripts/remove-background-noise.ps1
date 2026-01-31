# Remove background noise from Recording.m4a using FFmpeg
# Requires FFmpeg: https://ffmpeg.org/download.html
# Run: .\scripts\remove-background-noise.ps1

$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$InputFile  = Join-Path $ProjectRoot "assets\Recording.m4a"
$OutputFile = Join-Path $ProjectRoot "assets\Recording-clean.m4a"

if (-not (Test-Path $InputFile)) {
    Write-Error "Recording.m4a not found at: $InputFile"
    exit 1
}

$ffmpeg = Get-Command ffmpeg -ErrorAction SilentlyContinue
if (-not $ffmpeg) {
    Write-Error "FFmpeg not found. Install from https://ffmpeg.org/download.html"
    exit 1
}

Write-Host "Removing background noise from Recording.m4a..."
Write-Host "Input:  $InputFile"
Write-Host "Output: $OutputFile"

& ffmpeg -y -i $InputFile -af "afftdn=nr=14:nf=-38:tn=1" -c:a aac -b:a 192k $OutputFile

if ($LASTEXITCODE -eq 0) {
    Write-Host "Done. Clean recording saved to assets/Recording-clean.m4a"
} else {
    Write-Error "FFmpeg failed. Exit code: $LASTEXITCODE"
    exit $LASTEXITCODE
}
