const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000;

app.get('/health', (req, res) => {
  res.json({status: 'API Gateway running'});
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
