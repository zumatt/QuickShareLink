const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const issueBody = JSON.parse(process.env.ISSUE_BODY);

const { url, slug, expires } = issueBody;

const LINKS_FILE = "data/links.json";
const SLUGS_DIR = "docs/slugs";
const INFINITE = "1998-08-06";

if (!url || !expires) {
  throw new Error("Missing required fields");
}

const today = new Date();
const expDate = new Date(expires);
const maxDate = new Date();
maxDate.setFullYear(today.getFullYear() + 1);

if (
  expires !== INFINITE &&
  (expDate < today || expDate > maxDate)
) {
  throw new Error("Invalid expiration date");
}

let finalSlug = slug?.trim() || crypto.randomBytes(4).toString("hex");

const links = JSON.parse(fs.readFileSync(LINKS_FILE, "utf8"));

if (links[finalSlug]) {
  throw new Error("Slug already exists");
}

links[finalSlug] = { url, expires };

fs.writeFileSync(LINKS_FILE, JSON.stringify(links, null, 2));

const slugDir = path.join(SLUGS_DIR, finalSlug);
fs.mkdirSync(slugDir, { recursive: true });

fs.writeFileSync(
  path.join(slugDir, "index.html"),
  `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <script>
    window.location.replace("${url}");
  </script>
</head>
<body>Redirecting...</body>
</html>`
);
