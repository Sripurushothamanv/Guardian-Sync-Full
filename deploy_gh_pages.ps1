# Dedicated PowerShell script to deploy compiled website/dist to remote gh-pages branch
$distPath = "c:\Users\ssri4\OneDrive\Desktop\bugfreepdd\Guardian-sync\website\dist"
Set-Location $distPath

# Remove invalid token overrides from env
Remove-Item Env:\GITHUB_TOKEN -ErrorAction SilentlyContinue

# Fetch valid active token from GitHub CLI keyring
$token = (gh auth token).Trim()

if (-not $token) {
    Write-Error "Failed to retrieve active gh auth token."
    exit 1
}

# Initialize fresh git repository inside dist
if (Test-Path "$distPath\.git") {
    Remove-Item "$distPath\.git" -Recurse -Force
}

git init
git config core.longpaths true
git add -A
git commit -m "Deploy updated React website to GitHub Pages"
git push -f "https://$($token)@github.com/Sripurushothamanv/Guardian-Sync-Full.git" HEAD:gh-pages

Write-Host "SUCCESS: website/dist force-pushed to gh-pages branch successfully!"
