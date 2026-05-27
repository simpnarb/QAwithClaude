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

---

## Project Structure

```
QAwithClaude/
├── server.js               # Express API server
├── package.json
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

## Notes

- Sessions are stored in memory — restarting the server will log everyone out.
- `data/users.json` and `data/orders.json` are the live data files. Delete them to reset state (products.json should be kept).
- The `data-testid` attributes on all interactive elements mirror their `id` values, providing stable selectors for Playwright tests.
