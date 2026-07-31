$env:PORT = "5000"
if (-not (Test-Path .env)) {
  Copy-Item .env.example .env
}
npm install
npm run dev
