const express = require('express');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8000;

let users = [
  {id: '1', name: 'Ivan', email: 'ivan@gmail.com'},
  {id: '2', name: 'Ralina', email: 'ralina@gmail.com'}
];

app.get('/users', (req, res) => res.json({ success: true, data: users }));

app.listen(PORT, () => console.log(`Users service running on ${PORT}`));


app.post('/users', (req, res) => {
    const { email, name } = req.body;
    if (!email || !name) return res.status(400).json({ success: false, error: 'Missing email or name' });
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

app.put('/users/:id', (req, res) => {
    const user = users.find(u => u.id == req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    Object.assign(user, req.body);
    res.json({ success: true, data: user });
});

app.delete('/users/:id', (req, res) => {
    const index = users.findIndex(u => u.id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, error: 'User not found' });
    users.splice(index, 1);
    res.json({ success: true, message: 'User deleted' });
});