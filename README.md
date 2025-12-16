# QuickShareLink (QSL)

QuickShareLink is a **serverless URL shortener** built entirely on **GitHub Pages** and **GitHub Actions**.

No backend.  
No database.  
No external services.

Short links are generated, deployed, expired, and deleted using GitHub’s native tooling.

---

## ✨ Features

- 🔗 Custom or random slugs
- ⏳ Expiration date (up to 1 year)
- 🧹 Automatic cleanup of expired links

---

## 🏗️ How it works

1. User submits a link via the homepage
2. A GitHub Issue is created (no auth required)
3. GitHub Actions:
   - Validates input
   - Generates a redirect page
   - Stores metadata in `links.json`
4. GitHub Pages deploys the static site
5. A daily cleanup job deletes expired links

---

## 📁 Repository structure
```
.
├── .github/workflows/
│ ├── create-link.yml
│ └── cleanup-expired.yml
├── data/
│ └── links.json
├── public/
│ ├── index.html
│ ├── 404.html
│ └── slugs/
├── scripts/
│ ├── create-link.js
│ └── cleanup.js
└── README.md
```

---

## 🚀 Deployment

### 1. Enable GitHub Pages

- Repository → **Settings → Pages**
- Source:
  - Branch: `main`
  - Folder: `/public`

---

### 2. Allow GitHub Actions to push

- Settings → Actions → General
- Workflow permissions:
  - ✅ Read and write permissions

---

## 🔐 Security model

- Link creation is done via **GitHub Issues**
- Actions run with repository-scoped permissions only
- All operations are auditable via Git history

---

## 🧪 Testing

### Local testing

```bash
export ISSUE_BODY='{"url":"https://example.com","slug":"test","expires":"2099-01-01"}'
node scripts/create-link.js
```