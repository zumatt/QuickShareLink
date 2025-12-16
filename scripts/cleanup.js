const fs = require("fs");
const path = require("path");

const LINKS_FILE = "data/links.json";
const SLUGS_DIR = "public/slugs";
const INFINITE = "1998-08-06";

const today = new Date();
today.setHours(0, 0, 0, 0);

const links = JSON.parse(fs.readFileSync(LINKS_FILE, "utf8"));
let changed = false;

for (const [slug, data] of Object.entries(links)) {
  if (data.expires === INFINITE) continue;

  const exp = new Date(data.expires);
  exp.setHours(0, 0, 0, 0);

  if (exp < today) {
    fs.rmSync(path.join(SLUGS_DIR, slug), {
      recursive: true,
      force: true
    });
    delete links[slug];
    changed = true;
  }
}

if (changed) {
  fs.writeFileSync(LINKS_FILE, JSON.stringify(links, null, 2));
}
