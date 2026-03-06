# Generate tabBar icons for PetDimen WeChat Mini-Program
# Run: .\generate-icons.ps1

$iconDir = Join-Path $PSScriptRoot "assets\icons"

# Create directory if it doesn't exist
if (-not (Test-Path $iconDir)) {
    New-Item -ItemType Directory -Path $iconDir -Force | Out-Null
    Write-Host "✓ Created assets/icons directory"
}

# Minimal valid PNG file (1x1 transparent pixel)
$pngBytes = @(
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    0x00, 0x00, 0x00, 0x0D,
    0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01,
    0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00,
    0x1F, 0x15, 0xC4, 0x89,
    0x00, 0x00, 0x00, 0x0A,
    0x49, 0x44, 0x41, 0x54,
    0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01,
    0x0D, 0x0A, 0x2D, 0xB4,
    0x00, 0x00, 0x00, 0x00,
    0x49, 0x45, 0x4E, 0x44,
    0xAE, 0x42, 0x60, 0x82
)

$iconNames = @("home", "pet", "moments", "user")

foreach ($name in $iconNames) {
    # Create inactive icon
    $inactivePath = Join-Path $iconDir "$name.png"
    [System.IO.File]::WriteAllBytes($inactivePath, $pngBytes)
    Write-Host "✓ Created $name.png"
    
    # Create active icon
    $activePath = Join-Path $iconDir "$name-active.png"
    [System.IO.File]::WriteAllBytes($activePath, $pngBytes)
    Write-Host "✓ Created $name-active.png"
}

Write-Host ""
Write-Host "✓ All icon files generated successfully!"
Write-Host ""
Write-Host "Note: These are placeholder PNG files."
Write-Host "For better quality icons, consider:"
Write-Host "  1. Using design tools to create custom icons"
Write-Host "  2. Using icon libraries like Feather Icons or Material Icons"
Write-Host "  3. Running: node generate-icons.js (requires sharp package)"
