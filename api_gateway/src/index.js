const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000;

import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const USERS_URL = process.env.USERS_URL || 'http://service_users:8001';
const ORDERS_URL = process.env.ORDERS_URL || 'http://service_orders:8002';

app.get('/health', (req, res) => {
  res.json({status: 'API Gateway running'});
});

app.use(
  "/api/users",
  createProxyMiddleware({
    target: "USERS_URL",
    changeOrigin: true,
    pathRewrite: { "^/api/users": "" },
  })
);

app.use(
  "/api/orders",
  createProxyMiddleware({
    target: "ORDERS_URL",
    changeOrigin: true,
    pathRewrite: { "^/api/orders": "" },
  })
);

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
