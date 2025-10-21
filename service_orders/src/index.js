const express = require('express');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8001;

app.get('/orders', (req, res) => {
    res.json([]);
});

app.listen(PORT, () => console.log(`Orders service running on ${PORT}`));