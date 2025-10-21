const express = require('express');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8000;

app.get('/users', (req, res) => {
    res.json([]);
});

app.listen(PORT, () => console.log(`Users service running on ${PORT}`));