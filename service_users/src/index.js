const express = require('express');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8001;

app.get('/users', (req, res) => {
    res.json([]);
});

app.listen(PORT, () => console.log(`Users service running on ${PORT}`));

const users = [];
app.post('/users', (req, res) => {
    const { email, name } = req.body;
    const id = Date.now().toString();
    const user = { id, email, name };
    users.push(user);
    res.status(201).json({ success: true, data: user });
});

app.get('/users/:id', (req, res) => {
    const user = users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: user });
});