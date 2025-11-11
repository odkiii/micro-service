const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const pino = require('pino')();
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 8000;

import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const USERS_URL = process.env.USERS_URL || 'http://service_users:8001';
const ORDERS_URL = process.env.ORDERS_URL || 'http://service_orders:8002';

app.get('/health', (req, res) => {
  res.json({status: 'API Gateway running'});
});

app.use((req,res,next)=>{
  req.requestId = req.headers['x-request-id'] || uuidv4();
  res.setHeader('x-request-id', req.requestId);
  pino.info({ reqId: req.requestId, method: req.method, path: req.path });
  next();
});

function makeProxy(target) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
      if (req.headers['authorization']) proxyReq.setHeader('authorization', req.headers['authorization']);
      proxyReq.setHeader('x-request-id', req.requestId);
    },
    pathRewrite: (path, req) => path.replace(/^\/api/, '') // убрать "/api" 
  });
}

app.use('/api/users', makeProxy(USERS_URL));

app.use('/api/orders', makeProxy(ORDERS_URL));

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
