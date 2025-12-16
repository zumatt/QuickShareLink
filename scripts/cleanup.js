// scripts/cleanup.js
const fs = require("fs");
const path = require("path");

const LINKS_FILE = "data/links.json";
const SLUGS_DIR = "docs/slugs";
const INFINITE = "1998-08-06";

function loadLinks() {
  if (!fs.existsSync(LINKS_FILE)) return {};
  return JSON.parse(fs.readFileSync(LINKS_FILE, "utf8"));
}

function saveLinks(links) {
  fs.writeFileSync(LINKS_FILE, JSON.stringify(links, null, 2));
}

function deleteSlug(slug) {
  const slugDir = path.join(SLUGS_DIR, slug);
  if (fs.existsSync(slugDir)) {
    fs.rmSync(slugDir, { recursive: true, force: true });
    console.log(`Deleted slug: ${slug}`);
  }
}

function main() {
  const links = loadLinks();
  const today = new Date();
  let changed = false;

  for (const [slug, info] of Object.entries(links)) {
    if (info.expires === INFINITE) continue; // skip infinite links

    const expDate = new Date(info.expires);
    if (expDate < today) {
      deleteSlug(slug);
      delete links[slug];
      changed = true;
    }
  }

  if (changed) {
    saveLinks(links);
    console.log("Links.json updated after cleanup.");
  } else {
    console.log("No expired links found.");
  }
}

main();
