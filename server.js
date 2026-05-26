const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');

// --- Data helpers ---
function readJSON(file) {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
}
function writeJSON(file, data) {
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));
}

// --- Middleware ---
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'shop-secret-key-change-in-prod',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
  next();
}

// --- Auth routes ---
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: 'All fields required' });

  const users = readJSON('users.json');
  if (users.find(u => u.email === email)) return res.status(409).json({ error: 'Email already registered' });

  const hashed = await bcrypt.hash(password, 10);
  const user = { id: uuidv4(), email, name, password: hashed, cart: [], createdAt: new Date().toISOString() };
  users.push(user);
  writeJSON('users.json', users);

  req.session.userId = user.id;
  res.json({ id: user.id, email: user.email, name: user.name });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const users = readJSON('users.json');
  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Invalid email or password' });

  req.session.userId = user.id;
  res.json({ id: user.id, email: user.email, name: user.name });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ ok: true });
});

app.get('/api/auth/me', (req, res) => {
  if (!req.session.userId) return res.json(null);
  const users = readJSON('users.json');
  const user = users.find(u => u.id === req.session.userId);
  if (!user) return res.json(null);
  res.json({ id: user.id, email: user.email, name: user.name });
});

// --- Products ---
app.get('/api/products', (req, res) => {
  res.json(readJSON('products.json'));
});

// --- Cart ---
app.get('/api/cart', requireAuth, (req, res) => {
  const users = readJSON('users.json');
  const user = users.find(u => u.id === req.session.userId);
  const products = readJSON('products.json');

  const cart = (user.cart || []).map(item => {
    const product = products.find(p => p.id === item.productId);
    return product ? { ...item, ...product, quantity: item.quantity } : null;
  }).filter(Boolean);

  res.json(cart);
});

app.post('/api/cart/add', requireAuth, (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const products = readJSON('products.json');
  if (!products.find(p => p.id === productId)) return res.status(404).json({ error: 'Product not found' });

  const users = readJSON('users.json');
  const user = users.find(u => u.id === req.session.userId);
  const existing = user.cart.find(i => i.productId === productId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    user.cart.push({ productId, quantity });
  }

  writeJSON('users.json', users);
  res.json({ ok: true });
});

app.put('/api/cart/:productId', requireAuth, (req, res) => {
  const { quantity } = req.body;
  const users = readJSON('users.json');
  const user = users.find(u => u.id === req.session.userId);
  const item = user.cart.find(i => i.productId === req.params.productId);
  if (!item) return res.status(404).json({ error: 'Item not in cart' });

  if (quantity <= 0) {
    user.cart = user.cart.filter(i => i.productId !== req.params.productId);
  } else {
    item.quantity = quantity;
  }

  writeJSON('users.json', users);
  res.json({ ok: true });
});

app.delete('/api/cart/:productId', requireAuth, (req, res) => {
  const users = readJSON('users.json');
  const user = users.find(u => u.id === req.session.userId);
  user.cart = user.cart.filter(i => i.productId !== req.params.productId);
  writeJSON('users.json', users);
  res.json({ ok: true });
});

app.post('/api/cart/checkout', requireAuth, (req, res) => {
  const { address } = req.body;
  if (!address) return res.status(400).json({ error: 'Shipping address required' });

  const users = readJSON('users.json');
  const user = users.find(u => u.id === req.session.userId);
  if (!user.cart.length) return res.status(400).json({ error: 'Cart is empty' });

  const products = readJSON('products.json');
  const items = user.cart.map(item => {
    const product = products.find(p => p.id === item.productId);
    return { ...product, quantity: item.quantity, subtotal: product.price * item.quantity };
  });

  const total = items.reduce((sum, i) => sum + i.subtotal, 0);
  const order = {
    id: uuidv4(),
    userId: user.id,
    userName: user.name,
    items,
    total,
    address,
    status: 'Processing',
    createdAt: new Date().toISOString()
  };

  const orders = readJSON('orders.json');
  orders.push(order);
  writeJSON('orders.json', orders);

  user.cart = [];
  writeJSON('users.json', users);

  res.json(order);
});

// --- Orders ---
app.get('/api/orders', requireAuth, (req, res) => {
  const orders = readJSON('orders.json');
  res.json(orders.filter(o => o.userId === req.session.userId).reverse());
});

app.listen(PORT, () => {
  console.log(`Shop running at http://localhost:${PORT}`);
});
