# QuickShareLink

QuickShareLink is a **GitHub-powered short link service**. Users can create short links, set expiration dates, and manage them entirely via **GitHub Issues**. Expired links are automatically cleaned up once per day.

---

## Features

- Create short links via GitHub issues
- Custom or randomly generated slugs
- Expiration dates up to one year
- Automatic cleanup of expired links
- Delete links via issue comments (author or admin)
- Fully powered by GitHub Pages and Actions — no external server needed

---

## How It Works

### 1. Create a Short Link

1. Open a **new issue** in the repository.
2. Set the **issue title** to: `Create short link`
3. In the issue body, provide the following fields:
    ```
    URL: https://example.com
    Slug: mylink # optional, leave empty for random
    Expires: 2025-12-31 # or 1998-08-06 for infinite
    ```
4. Once the issue is created, the GitHub Action will:
    - Validate the data
    - Generate the redirect HTML page under `docs/slugs/<slug>`
    - Update `data/links.json`
    - Comment back with the short link:  
        `✅ Link created: https://qsl.li/<slug>`
    - Close the issue automatically

---

### 2. Delete a Link

To delete a short link:

1. Comment on the original issue with: `delete link <slug>`
2. Only the **issue author** or **admins** can delete links.
3. The GitHub Action will:
    - Remove the slug folder from `docs/slugs`
    - Update `data/links.json`
    - Comment with confirmation:  
        `✅ Link "<slug>" deleted by @username`

---

### 3. Automatic Cleanup

- Expired links (with a date in the past) are automatically deleted **once per month** via a scheduled GitHub Action.

---

## Technical Details

- **Hosting:** GitHub Pages (`docs/` folder)
- **Storage:** `data/links.json` stores all slug mappings
- **Scripts:**
  - `scripts/create-link.js` → handles issue-based creation
  - `scripts/delete-link.js` → handles comment-based deletion
  - `scripts/cleanup.js` → deletes expired links automatically
- **Workflows:**
  - `create-link.yml` → runs on issue creation
  - `delete-link.yml` → runs on comment creation
  - `cleanup-expired.yml` → runs monthly via cron

---

## Link Expiration Rules

- Maximum expiration: **1 year from creation**
- Invalid or past dates will be rejected

---

## Example Issue Body

URL: https://example.com
Slug: mylink
Expires: 2025-12-31

- If `Slug` is omitted, a random 8-character slug is generated.
- After creation, the short link will be available at:

https://qsl.li/mylink

---

## Future ToDo (or possible contributions)

- [ ] Add a homepage of the project explaining how to use it
- [ ] Create favicon
- [ ] Add a reminder one week before and one day before expiring
- [ ] Add function to renew link (max 1 year)
- [x] Changing issue method with form
- [x] Add citation.cff