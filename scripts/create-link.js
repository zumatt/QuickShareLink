const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { Octokit } = require("@octokit/rest");

const LINKS_FILE = "data/links.json";
const SLUGS_DIR = "docs";
const INFINITE = "1998-08-06";

function parseIssueBody(body) {
  const data = {};
  body.split("\n").forEach(line => {
    const [key, ...rest] = line.split(":");
    if (!key || rest.length === 0) return;
    data[key.trim().toLowerCase()] = rest.join(":").trim();
  });
  return data;
}

async function main() {
  const { url, slug, expires } = parseIssueBody(process.env.ISSUE_BODY);

  if (!url || !expires) throw new Error("Missing required fields");

  const today = new Date();
  const expDate = new Date(expires);
  const maxDate = new Date();
  maxDate.setFullYear(today.getFullYear() + 1);

  if (expires !== INFINITE && (expDate < today || expDate > maxDate)) {
    throw new Error("Invalid expiration date");
  }

  let finalSlug = slug?.trim() || crypto.randomBytes(4).toString("hex");

  // Load links.json
  let links = {};
  if (fs.existsSync(LINKS_FILE)) {
    links = JSON.parse(fs.readFileSync(LINKS_FILE, "utf8"));
  }

  // Ensure slug uniqueness
  while (links[finalSlug]) {
    finalSlug = crypto.randomBytes(4).toString("hex");
  }

  links[finalSlug] = { url, expires };
  fs.writeFileSync(LINKS_FILE, JSON.stringify(links, null, 2));

  const slugDir = path.join(SLUGS_DIR, finalSlug);
  fs.mkdirSync(slugDir, { recursive: true });

  const redirectHTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta http-equiv="refresh" content="0; url=${url}">
<title>Redirecting...</title>
</head>
<body>
<p>Redirecting to <a href="${url}">${url}</a></p>
</body>
</html>`;

  fs.writeFileSync(path.join(slugDir, "index.html"), redirectHTML);

  // Post comment
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  await octokit.issues.createComment({
    owner: "zumatt",
    repo: "QuickShareLink",
    issue_number: process.env.ISSUE_NUMBER,
    body: `✅ Link created: https://qsl.li/${finalSlug}\n⏱️ The link will be visible and working in around 1 minute.`
  });

  console.log(`✅ Short link created: ${finalSlug}`);
}

main().catch(err => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
