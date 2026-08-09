const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;
const API_TARGET = process.env.API_TARGET || 'http://localhost:5000';
const STATIC_DIR = process.env.STATIC_DIR || path.join(__dirname, '../FE/touris-app/build');

app.use(createProxyMiddleware({
  target: API_TARGET,
  changeOrigin: true,
  pathFilter: '/api/**',
}));

app.use(express.static(STATIC_DIR));
app.get('*', (req, res) => {
  res.sendFile(path.join(STATIC_DIR, 'index.html'));
});

app.listen(PORT, () => console.log(`Unified app on :${PORT} -> API ${API_TARGET}`));
