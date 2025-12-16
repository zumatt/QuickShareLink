// scripts/delete-link.js
const fs = require("fs");
const path = require("path");
const { Octokit } = require("@octokit/rest");

const SLUGS_DIR = "docs";
const LINKS_FILE = "data/links.json";

// ENV VARIABLES from GitHub Action
const COMMENT_BODY = process.env.COMMENT_BODY;
const ISSUE_NUMBER = parseInt(process.env.ISSUE_NUMBER, 10);
const COMMENT_AUTHOR = process.env.COMMENT_AUTHOR;
const ISSUE_AUTHOR = process.env.ISSUE_AUTHOR;
const ADMIN_USERS = (process.env.ADMIN_USERS || "").split(","); // comma-separated list
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!COMMENT_BODY || !ISSUE_NUMBER || !COMMENT_AUTHOR || !GITHUB_TOKEN) {
  console.error("Missing required environment variables");
  process.exit(1);
}

// Parse command: expecting 'delete link <slug>'
const match = COMMENT_BODY.match(/delete link (\S+)/i);
if (!match) {
  console.log("No delete command found in comment.");
  process.exit(0);
}

const slugToDelete = match[1];

// Check permissions
if (COMMENT_AUTHOR !== ISSUE_AUTHOR && !ADMIN_USERS.includes(COMMENT_AUTHOR)) {
  console.log(`User ${COMMENT_AUTHOR} is not allowed to delete this link.`);
  process.exit(0);
}

// Load links
let links = {};
if (fs.existsSync(LINKS_FILE)) {
  links = JSON.parse(fs.readFileSync(LINKS_FILE, "utf8"));
}

if (!links[slugToDelete]) {
  console.log(`Slug "${slugToDelete}" does not exist.`);
  process.exit(0);
}

// Delete folder
const slugDir = path.join(SLUGS_DIR, slugToDelete);
if (fs.existsSync(slugDir)) {
  fs.rmSync(slugDir, { recursive: true, force: true });
  console.log(`Deleted slug folder: ${slugToDelete}`);
}

// Remove from links.json
delete links[slugToDelete];
fs.writeFileSync(LINKS_FILE, JSON.stringify(links, null, 2));

// Comment back
const octokit = new Octokit({ auth: GITHUB_TOKEN });
(async () => {
  await octokit.issues.createComment({
    owner: "zumatt",
    repo: "QuickShareLink",
    issue_number: ISSUE_NUMBER,
    body: `✅ Link "${slugToDelete}" deleted by @${COMMENT_AUTHOR}`
  });
})();
