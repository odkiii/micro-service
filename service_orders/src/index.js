const express = require('express');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8001;

app.get('/orders', (req, res) => {
    res.json([]);
});

app.listen(PORT, () => console.log(`Orders service running on ${PORT}`));

const orders = [];
app.post('/orders', (req, res) => {
    const { userId, items } = req.body;
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
