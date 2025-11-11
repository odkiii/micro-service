const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const pino = require('pino')();
const { v4: uuidv4 } = require('uuid');
app.use(express.json());

const PORT = process.env.PORT || 8002;
const JWT_SECRET = process.env.JWT_SECRET || 'verysecretkeyjwt123';

let orders = [
  { id: '1', item: 'McLaren', userId: '1', status: 'created', createdAt: new Date().toISOString() },
  { id: '2', item: 'Lambo', userId: '2', status: 'created', createdAt: new Date().toISOString() }
];

app.use((req,res,next)=>{
  req.requestId = req.headers['x-request-id'] || uuidv4();
  res.setHeader('x-request-id', req.requestId);
  pino.info({ reqId: req.requestId, method: req.method, path: req.path });
  next();
});

function authMiddleware(req, res, next) {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ success:false, error:'Missing token' });
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ success:false, error:'Invalid token' });
  }
}

app.get('/orders', (req, res) => res.json({ success: true, data: orders }));

app.listen(PORT, () => console.log(`Orders service running on ${PORT}`));

app.post('/orders', authMiddleware, (req, res) => {
    const { item, quantity } = req.body;
    if (!item) return res.status(400).json({ success:false, error:'Missing item' });
    const order = { id: uuidv4(), item, quantity: quantity || 1, userId: req.user.id, status: 'created', createdAt: new Date().toISOString() };
    orders.push(order);
    pino.info({ event: 'order.created', orderId: order.id, userId: order.userId });
    res.status(201).json({ success:true, data: order });
});

app.get('/orders/:id', (req, res) => {
    const order = orders.find(o => o.id === req.params.id);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    res.json({ success: true, data: order });
});

app.put('/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

  Object.assign(order, req.body);
  res.json({ success: true, data: order });
});

app.delete('/orders/:id', (req, res) => {
  const index = orders.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, error: 'Order not found' });

  orders.splice(index, 1);
  res.json({ success: true, message: 'Order deleted' });
});
