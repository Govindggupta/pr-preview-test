# Next.js PR Previews on GitHub Pages

If you want a live preview link for every pull request, this setup does exactly that.

Each PR gets its own URL:

```
https://<username>.github.io/<repo>/pr-preview/pr-<number>/
```

When the PR is closed or merged, the preview is cleaned up automatically.

---

## What you get

- Deploys your main site to GitHub Pages whenever `main` is updated
- Generates a unique preview URL for each pull request
- Removes preview folders automatically when PRs are closed
- Adds preview comments directly on PRs
- Works with `pnpm`

---

## Setup

### 1) Configure Next.js export + base path

Update `next.config.ts`:

```ts
import type { NextConfig } from "next";

const isGitHubActions = process.env.GITHUB_ACTIONS === "true";
const isPRPreview = process.env.BASE_PATH !== undefined;

const basePath = isPRPreview
  ? process.env.BASE_PATH
  : isGitHubActions
  ? "/your-repo-name"
  : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath ? basePath + "/" : "",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

Replace `your-repo-name` with your repository name.

If your repository itself is `username.github.io` (User/Org Pages), keep the production base path empty:

- Use `""` instead of `"/your-repo-name"` in `next.config.ts`
- Your main site will be served from `https://username.github.io/`

---

### 2) Add main deploy workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

permissions:
  contents: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout 🛎️
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: latest

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: pnpm

      - name: Install Dependencies
        run: pnpm install

      - name: Build
        run: pnpm build

      - name: Add .nojekyll
        run: touch ./out/.nojekyll

      - name: Deploy 🚀
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          branch: gh-pages
          folder: out
          clean: true
          clean-exclude: pr-preview/
          force: false
```

This publishes your production Pages site while keeping PR preview folders intact.

---

### 3) Add PR preview workflow

Create `.github/workflows/preview.yml`:

```yaml
name: PR Preview

on:
  pull_request:
    types:
      - opened
      - reopened
      - synchronize
      - closed

permissions:
  contents: write
  pull-requests: write

concurrency:
  group: preview-${{ github.ref }}
  cancel-in-progress: true

jobs:
  deploy-preview:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: latest

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: pnpm

      - name: Install Dependencies
        if: github.event.action != 'closed'
        run: pnpm install

      - name: Build
        if: github.event.action != 'closed'
        env:
          BASE_PATH: /your-repo-name/pr-preview/pr-${{ github.event.number }}
        run: pnpm build

      - name: Add .nojekyll
        if: github.event.action != 'closed'
        run: touch ./out/.nojekyll

      - name: Deploy PR Preview 🚀
        uses: rossjrw/pr-preview-action@v1
        with:
          source-dir: ./out
          preview-branch: gh-pages
          umbrella-dir: pr-preview
          action: auto
```

Again, replace `your-repo-name` in `BASE_PATH` with your repo name.

For `username.github.io` repositories, use this instead:

```yaml
BASE_PATH: /pr-preview/pr-${{ github.event.number }}
```

No repo prefix is needed in that case.

---

## URL patterns (quick reference)

| Repository type | Main URL | PR Preview URL |
|---|---|---|
| Project repo (`my-app`) | `https://username.github.io/my-app/` | `https://username.github.io/my-app/pr-preview/pr-<number>/` |
| User/Org Pages repo (`username.github.io`) | `https://username.github.io/` | `https://username.github.io/pr-preview/pr-<number>/` |

---

### 4) Check GitHub repo settings

- Go to **Settings → Pages** and set source to **Deploy from branch** with branch `gh-pages`
- Go to **Settings → Actions → General → Workflow permissions** and enable **Read and write permissions**

---

## How it behaves

| Event | Result |
|---|---|
| Push to `main` | Deploys to `https://<username>.github.io/<repo>/` |
| PR opened / updated | Deploys preview to `.../pr-preview/pr-{number}/` |
| PR closed / merged | Deletes that PR preview automatically |

---

## Stack

- [Next.js](https://nextjs.org/)
- [JamesIves/github-pages-deploy-action](https://github.com/JamesIves/github-pages-deploy-action)
- [rossjrw/pr-preview-action](https://github.com/rossjrw/pr-preview-action)