# DFD Level 1 — Mobile Web Stack

Self-contained implementation of:

`Actor (Mobile Browser) → Process 1 Validation → Database → Process 2 Logic → Process 3 Output → Dashboard + PDF`.

**Project layout (created under `dfd-mobile-web/` alongside the BinRazali React Native app):**

| Path | Role |
|------|------|
| `client/` | React + Vite + Tailwind actor UI (Modules 1 & 6) |
| `server/` | Express REST + JWT (Processes 1–3) |
| `database/` | MySQL schema + Node seed script |
| `docs/user-guide.pdf` | Generated handbook (`npm run guide`) |
| `docs/DFD_LEVEL1_REFERENCE_GRADING_SYSTEM.md` | Level 1 DFD from your coursework diagram (tables + **Mermaid** + mapping) |
| `docs/educational-dfd-level1-reference.png` | Image copy of the **printed DFD** (reference photo) |
| `docs/dfd-level1-diagram.pdf` | **Standalone DFD-only PDF** (`npm run dfd-pdf`) — embeds the PNG above |
| `docs/DFD_LEVEL1_FIELD_REPORT_PROJECT.md` | **Project DFD narrative** mirroring coursework layout (entities P3-P12 stores D1-D3 outputs) |
| `docs/dfd-level1-field-report-poster.html` | **Poster** (Chrome → Print → PDF) styled like coursework figure |

**Coursework reference vs this project**

- Course photo PNG: **`docs/educational-dfd-level1-reference.png`**
- Equivalent spec for **this** build: **`docs/DFD_LEVEL1_FIELD_REPORT_PROJECT.md`**
- Printable poster (layout like the coursework board): **`docs/dfd-level1-field-report-poster.html`** — open in Chrome → **Print → Save as PDF** (landscape, enable **Background graphics**)

## Download the PDF user guide

After `npm run guide`, open the file on disk:

**`dfd-mobile-web/docs/user-guide.pdf`**

After `npm run dfd-pdf`, open the **Data Flow Diagram-only** PDF:

**`dfd-mobile-web/docs/dfd-level1-diagram.pdf`**

In Cursor: right‑click the file → **Reveal in File Explorer**, then save or upload as needed.

With the API running (`npm run dev` in `server/`):

- **User guide:** http://localhost:5000/docs/user-guide.pdf  
- **DFD diagram only:** http://localhost:5000/docs/dfd-level1-diagram.pdf  
- **Through Vite:** same paths on port **5173** (e.g. `http://localhost:5173/docs/dfd-level1-diagram.pdf`)

If you get JSON “PDF not generated yet”, run `npm run guide` or **`npm run dfd-pdf`** from the `dfd-mobile-web` folder as needed.

## Prerequisites

- Node.js **18+**
- **MySQL 8+**
- A phone or emulator with Safari / Chrome (**Android 8+ / iOS 13+**) for handset testing

## 1. Database

```powershell
mysql -u root -p < database/schema.sql
```

Copy environment template:

```powershell
copy server\.env.example server\.env   # PowerShell Windows
```

Edit `server/.env`: set `DB_PASSWORD`, a strong `JWT_SECRET`, and `CLIENT_URL` (e.g. `http://localhost:5173` or your LAN URL).

## 2. Seed sample users & records

```powershell
cd server
npm install
npm run seed
```

Default accounts (change after first login in production):

- `user@dfd.local` / `Password123!`
- `admin@dfd.local` / `AdminPass123!`

## 3. API server

```powershell
cd server
npm run dev
```

Health check: `http://localhost:5000/api/health`

## 4. Client (mobile-first)

```powershell
cd client
npm install
npm run dev
```

Open on the phone: `http://<your-pc-lan-ip>:5173` (same Wi‑Fi). The Vite dev server proxies `/api` to port **5000**.

## 5. Generate `docs/user-guide.pdf`

```powershell
cd ..        # repo root → dfd-mobile-web
npm install  # installs pdfkit for the generator
npm run guide
```

## DFD ↔ code map

| DFD bubble | Implemented in |
|-------------|----------------|
| Actor interface | `client/src/components/*`, `client/src/pages/*` |
| Process 1 (validate) | Express validators + controllers + HTTPS JSON |
| Data store | `database/schema.sql`, `server/models/*` |
| Process 2 (retrieve / rules) | `server/controllers/outputController.js`, filtered SQL |
| Process 3 (format) | `outputController.buildDashboardPayload`, React renderers |
| Final output | `Dashboard.jsx`, `OutputView.jsx`, jsPDF export |

## Production notes

- Build static client (`npm run build` in `client/`) and serve via nginx/Express static.
- Use HTTPS, rotate `JWT_SECRET`, and store DB credentials only in environment variables.
- Update `CLIENT_URL` / CORS for your public domain.

## License

Educational template — adjust for your institution’s policies.
