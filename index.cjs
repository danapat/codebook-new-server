const jsonServer = require('./node_modules/json-server');
const express = require('express');
const path = require('path');
const cors = require('cors');  // Importiere das cors-Paket

const port = process.env.PORT || 8000 


const server = express();
const router = jsonServer.router('db.json'); // Mock DB
const middlewares = jsonServer.defaults();

// Erlaube alle Ursprünge (CORS)
server.use(cors());  // Dies erlaubt Anfragen von jedem Origin, also auch von localhost:3000

// JSON parser
server.use(express.json());
server.use(middlewares);

// Custom auth middleware (replaces json-server-auth)
server.use((req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  // Fake token logic - for dev use only
  if (token === 'devtoken') {
    req.user = { id: 1, username: 'admin', role: 'admin' };
    return next();
  }

  res.status(403).json({ error: 'Forbidden' });
});

// Attach DB
server.db = router.db;

// Custom protected route: GET user by ID
server.get('/600/users/:id', (req, res) => {
  const { id } = req.params;
  const user = server.db.get('users').find({ id: parseInt(id) }).value();

  if (!user) return res.status(404).json({ error: 'User not found' });

  res.status(200).json(user);
});

// Custom protected route: GET order by ID
server.get('/660/orders/:id', (req, res) => {
  const { id } = req.params;
  const order = server.db.get('orders').find({ id: parseInt(id) }).value();

  if (!order) return res.status(404).json({ error: 'Order not found' });

  res.status(200).json(order);
});

// Custom protected route: POST new order
server.post('/660/orders', (req, res) => {
  const { userId, items, totalAmount } = req.body;

  if (!userId || !items || !totalAmount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newOrder = { id: Date.now(), userId, items, totalAmount };
  server.db.get('orders').push(newOrder).write();

  res.status(201).json({ message: 'Order created successfully', order: newOrder });
});

server.get('/444/products', (req, res) => {
  const nameLike = req.query.name_like || '';
  const products = server.db.get('products').filter(product => 
    product.name.toLowerCase().includes(nameLike.toLowerCase())
  ).value();
  if (!products.length) return res.status(404).json({ error: 'No products found' });
  res.status(200).json(products);
});


// Public route: Register new user
server.post('/register', (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const newUser = { id: Date.now(), username, email, password };
  server.db.get('users').push(newUser).write();

  res.status(201).json({ message: 'User registered successfully', user: newUser });
});

// Public route: Login user
server.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log("Login Request:", req.body); // Debugging Log für die Anfrage
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = server.db.get('users').find({ email, password }).value();
  console.log("Matched User:", user); // Debugging Log für den gefundenen Benutzer
  if (!user) {
    return res.status(400).json({ error: 'Invalid email or password' });
  }

  // Dummy access token
  res.status(200).json({
    message: 'Login successful',
    accessToken: 'devtoken',
    user: {
      email: user.email,
      password: user.password,
      name: user.name
    }
  });
});


// Mount router for default routes
server.use('/api', router);

// Start server
server.listen(port, () => {
  console.log(`Mock server running at http://localhost:${port}`);
});
