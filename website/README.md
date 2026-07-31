# Guardian Sync - Website

The Guardian Sync web application built with React + Vite, hosted on GitHub Pages.

## Live Website

🌐 **Live at:** `https://sripurushothamanv.github.io/Guardian-sync-website/`

## GitHub Pages Deployment

This repository includes an automated GitHub Actions workflow that builds and deploys the website to GitHub Pages on every push to `main`.

### Setup Instructions:

1. Push your changes to the `main` branch of this GitHub repository.
2. Go to your repository on GitHub: **Settings → Pages**.
3. Under **Build and deployment → Source**, select **GitHub Actions**.
4. The workflow in `.github/workflows/deploy-website.yml` will automatically build and publish the site.

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Related Repositories

- **Mobile App:** [Guardian-sync-mobile](https://github.com/Sripurushothamanv/Guardian-sync-mobile)
