# ShopSimple

A lightweight, full-stack e-commerce web app built with Node.js, Express, and vanilla JavaScript. No frameworks, no database — just a clean, working storefront you can run locally in seconds.

---

## Features

- **Authentication** — Register and log in with bcrypt-hashed passwords and server-side sessions. Success and error alerts on all auth actions.
- **Product catalog** — 8 sample products across Electronics and Accessories categories, displayed in a responsive grid.
- **Shopping cart** — Add items, adjust quantities, remove items, and see a live subtotal. Free shipping on orders over $50.
- **Checkout** — Modal form for shipping details; places the order and clears the cart.
- **Order history** — View all past orders with itemized breakdown, total, status, date, and shipping address.
- **Persistent storage** — All data is stored in JSON files (`data/`), so it survives server restarts.
- **Test-ready** — Every interactive element carries a `data-testid` attribute matching its `id`, making it easy to target with Playwright or other testing tools.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Server | Node.js + Express |
| Auth | `express-session` + `bcryptjs` |
| Storage | JSON flat files |
| Frontend | Vanilla HTML / CSS / JavaScript |
| Testing | Playwright (`@playwright/test`) |
| Reporting | Allure (`allure-playwright`) + GitHub Pages |

---

## Project Structure

```
QAwithClaude/
├── server.js               # Express API server
├── package.json
├── playwright.config.ts    # Playwright + Allure reporter config
├── .github/
│   └── workflows/
│       └── playwright.yml  # CI: run tests and publish Allure report to GitHub Pages
├── data/
│   ├── products.json       # Product catalog (static seed data)
│   ├── users.json          # Registered users (bcrypt passwords + cart state)
│   └── orders.json         # Placed orders
└── public/
    ├── index.html          # Shop / product listing page
    ├── login.html          # Sign in + register (toggle between forms)
    ├── cart.html           # Cart management + checkout modal
    ├── orders.html         # Order history
    ├── css/
    │   └── style.css       # All styles (CSS custom properties, responsive)
    └── js/
        └── app.js          # Shared utilities: apiFetch, toast, loadNav
```

---

## API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create a new account |
| `POST` | `/api/auth/login` | Log in |
| `POST` | `/api/auth/logout` | Log out |
| `GET` | `/api/auth/me` | Get current session user |

### Products
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | List all products |

### Cart *(requires login)*
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/cart` | Get current user's cart |
| `POST` | `/api/cart/add` | Add a product to the cart |
| `PUT` | `/api/cart/:productId` | Update item quantity (set to 0 to remove) |
| `DELETE` | `/api/cart/:productId` | Remove item from cart |
| `POST` | `/api/cart/checkout` | Place order and clear cart |

### Orders *(requires login)*
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/orders` | List current user's order history |

---

## Getting Started

**Install dependencies:**
```bash
npm install
```

**Start the server:**
```bash
node server.js
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Stop the server** (if started in the background):
```powershell
Get-Process node | Stop-Process
```

---

## Running Tests

This project uses [Playwright](https://playwright.dev/) for end-to-end testing.

```bash
npx playwright test
```

To run with the browser visible:
```bash
npx playwright test --headed
```

---

## Allure Reporting

Test results are published as an [Allure](https://allurereport.org/) report to **GitHub Pages** automatically on every push to `main`.

### Setup

**1. Install the Allure Playwright reporter:**
```bash
npm install --save-dev allure-playwright
```

**2. Configure `playwright.config.ts` to use the Allure reporter:**
```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['list'],
    ['allure-playwright', { outputFolder: 'allure-results' }]
  ],
});
```

**3. Enable GitHub Pages** in your repository:
- Go to **Settings → Pages**
- Set the source to **GitHub Actions**

### GitHub Actions Workflow

The workflow at `.github/workflows/playwright.yml` runs on every push to `main`:

1. Starts the ShopSimple server
2. Runs the full Playwright test suite
3. Generates the Allure HTML report
4. Publishes it to GitHub Pages

```yaml
name: Playwright Tests

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Start server
        run: node server.js &
        env:
          PORT: 3000

      - name: Wait for server
        run: npx wait-on http://localhost:3000

      - name: Run Playwright tests
        run: npx playwright test

      - name: Generate Allure report
        if: always()
        run: npx allure generate allure-results --clean -o allure-report

      - name: Upload Pages artifact
        if: always()
        uses: actions/upload-pages-artifact@v3
        with:
          path: allure-report

  deploy:
    needs: test
    if: always()
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Viewing the Report Locally

To generate and open the report on your machine:

```bash
npx playwright test
npx allure generate allure-results --clean -o allure-report
npx allure open allure-report
```

> **Note:** The Allure CLI must be installed. You can install it with `npm install -g allure-commandline` or use the bundled `npx allure` wrapper above.

### Live Report

Once the workflow runs, the report is available at:
```
https://<your-github-username>.github.io/<your-repo-name>/
```

---

## Notes

- Sessions are stored in memory — restarting the server will log everyone out.
- `data/users.json` and `data/orders.json` are the live data files. Delete them to reset state (products.json should be kept).
- The `data-testid` attributes on all interactive elements mirror their `id` values, providing stable selectors for Playwright tests.
