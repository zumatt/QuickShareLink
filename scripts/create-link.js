const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { Octokit } = require("@octokit/rest");

const LINKS_FILE = "data/links.json";
const SLUGS_DIR = "docs";
const INFINITE = "1998-08-06";

function parseIssueBody(body) {
  const data = {};
  
  // GitHub issue forms generate output with headers like "### Field Label"
  // followed by the value on the next line(s)
  const lines = body.split("\n");
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Look for field headers
    if (line.startsWith("### ")) {
      const fieldName = line.substring(4).trim().toLowerCase();
      let value = "";
      
      // Collect the value from subsequent non-header lines
      for (let j = i + 1; j < lines.length; j++) {
        const nextLine = lines[j].trim();
        if (nextLine.startsWith("###") || nextLine.startsWith("##")) {
          break;
        }
        if (nextLine && !nextLine.startsWith("_No response_")) {
          value = nextLine;
          break;
        }
      }
      
      // Map field names to expected keys
      if (fieldName === "url") {
        data.url = value;
        console.log("Parsed URL:", value);
      } else if (fieldName === "slug") {
        data.slug = value;
        console.log("Parsed Slug:", value);
      } else if (fieldName === "expiration date") {
        data.expires = value;
        console.log("Parsed Expiration Date:", value);
      }
    }
  }
  
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

  // Add tracking parameter to URL
  const finalUrl = url.includes('?') ? `${url}&source=qsl` : `${url}?source=qsl`;

  const redirectHTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta http-equiv="refresh" content="0; url=${finalUrl}">
<title>Redirecting...</title>
</head>
<body>
<p>Redirecting to <a href="${finalUrl}">${finalUrl}</a></p>
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
