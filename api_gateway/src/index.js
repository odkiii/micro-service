const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000;

import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

app.get('/health', (req, res) => {
  res.json({status: 'API Gateway running'});
});

app.use(
  "/api/users",
  createProxyMiddleware({
    target: "http://localhost:3001",
    changeOrigin: true,
    pathRewrite: { "^/api/users": "" },
  })
);

app.use(
  "/api/orders",
  createProxyMiddleware({
    target: "http://localhost:3002",
    changeOrigin: true,
    pathRewrite: { "^/api/orders": "" },
  })
);

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
