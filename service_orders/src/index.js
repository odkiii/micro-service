const express = require('express');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8002;

let orders = [
  {id: 1, item: 'McLaren', userId: 1, status: 'created'},
  {id: 2, item: 'Lambo', userId: 2, status: 'created'}
];

app.get('/orders', (req, res) => res.json({ success: true, data: orders }));

app.listen(PORT, () => console.log(`Orders service running on ${PORT}`));

app.post('/orders', (req, res) => {
    const { userId, items } = req.body;
    if (!userId || !item) return res.status(400).json({ success: false, error: 'Missing userId or item' });
    const id = Date.now().toString();
    const order = { id, userId, items, status: 'created' };
    orders.push(order);
    res.status(201).json({ success: true, data: order });
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
