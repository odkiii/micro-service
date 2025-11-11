const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pino = require('pino');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8001;
const JWT_SECRET = process.env.JWT_SECRET || 'verysecretkeyjwt123';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
});

let users = [
  {id: '1', name: 'Ivan', email: 'ivan@gmail.com', passwordHash: null, roles: ['admin']},
  {id: '2', name: 'Ralina', email: 'ralina@gmail.com', passwordHash: null, roles: ['user']}
];

(async () => {
  for (const u of users) {
    if (!u.passwordHash) u.passwordHash = await bcrypt.hash('password', 10);
  }
})();

app.get('/users', (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || '1'));
  const limit = Math.min(50, parseInt(req.query.limit || '10'));
  const start = (page - 1) * limit;
  const data = users.slice(start, start + limit).map(u => ({ id: u.id, email: u.email, name: u.name }));
  res.json({ success: true, data, meta: { page, limit, total: users.length }});
});

app.use((req, res, next) => {
  req.requestId = req.headers['x-request-id'] || uuidv4();
  res.setHeader('x-request-id', req.requestId);
  pino.info({ reqId: req.requestId, method: req.method, path: req.path });
  next();
});

function authMiddleware(req, res, next) {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ success:false, error:'Missing token' });
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { id, roles, iat, exp }
    next();
  } catch (e) {
    return res.status(401).json({ success:false, error:'Invalid token' });
  }
}

app.post('/register', async (req, res) => {
  const { email, name, password } = req.body;
  
  if (!email || !name || !password) {
    return res.status(400).json({ 
      success: false, 
      error: { code: 'VALIDATION_ERROR', message: 'Missing email, name or password' } 
    });
  }

  // существует ли пользователь
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    logger.warn({ requestId: req.id, email }, 'User already exists');
    return res.status(409).json({ 
      success: false, 
      error: { code: 'USER_EXISTS', message: 'User with this email already exists' } 
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = Date.now().toString();
    const user = { 
      id, 
      email, 
      name, 
      password: hashedPassword,
      roles: ['user'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    users.push(user);
    
    logger.info({ requestId: req.id, userId: id }, 'User registered successfully');
    
    res.status(201).json({ 
      success: true, 
      data: { id, email, name, roles: ['user'] } 
    });
  } catch (error) {
    logger.error({ requestId: req.id, error }, 'Registration failed');
    res.status(500).json({ 
      success: false, 
      error: { code: 'INTERNAL_ERROR', message: 'Registration failed' } 
    });
  }
});

app.post('/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success:false, error:'Missing email or password' });
    const user = users.find(u => u.email === email);
    if (!user) return res.status(401).json({ success:false, error:'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ success:false, error:'Invalid credentials' });
    const token = jwt.sign({ id: user.id, roles: user.roles }, JWT_SECRET, { expiresIn: '2h' });
    pino.info({ event: 'user.login', userId: user.id });
    return res.json({ success: true, data: { token }});
  } catch (e) {
    pino.error(e);
    return res.status(500).json({ success:false, error:'Internal error' });
  }
});

app.get('/users/me', authMiddleware, (req, res) => {
  const u = users.find(x => x.id === req.user.id);
  if (!u) return res.status(404).json({ success:false, error:'User not found' });
  res.json({ success:true, data: { id: u.id, email: u.email, name: u.name, roles: u.roles }});
});


app.post('/users', async (req, res) => {
  try {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
      return res.status(400).json({ success: false, error: 'Missing email, name or password' });
    }
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ success: false, error: 'User with this email already exists' });
    }
    const id = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);
    const user = { id, email, name, passwordHash, roles: ['user'], createdAt: new Date().toISOString() };
    users.push(user);
    pino.info({ event: 'user.register', userId: id });
    return res.status(201).json({ success: true, data: { id, email, name }});
  } catch (e) {
    pino.error(e);
    return res.status(500).json({ success: false, error: 'Internal error' });
  }
});

app.get('/users/:id', (req, res) => {
    const user = users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: { id:user.id, email:user.email, name:user.name } });
});

app.put('/users/:id', (req, res) => {
    const user = users.find(u => u.id == req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    Object.assign(user, req.body);
    res.json({ success: true, data: { id:user.id, email:user.email, name:user.name } });
});

app.delete('/users/:id', (req, res) => {
    const index = users.findIndex(u => u.id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, error: 'User not found' });
    users.splice(index, 1);
    res.json({ success: true, message: 'User deleted' });
});

app.listen(PORT, () => console.log(`Users service running on ${PORT}`));