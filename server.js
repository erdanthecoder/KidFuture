const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const JWT_SECRET = process.env.JWT_SECRET || 'kidlearn-super-secret-key-2024';
const DB_PATH = path.join(__dirname, 'data.json');

let data = { users: [], quizScores: [], gameScores: [], announcements: [], worldMessages: [] };

function loadData() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf8');
      data = JSON.parse(raw);
    }
  } catch (e) { console.log('Data load error:', e.message); }
}

function saveData() {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (e) { console.log('Data save error:', e.message); }
}

loadData();

function findUser(query) {
  return data.users.find(u => {
    if (query.id) return u.id === query.id;
    if (query.username) return u.username === query.username;
    return false;
  });
}

function sanitizeUser(user) {
  if (!user) return null;
  return { id: user.id, username: user.username, role: user.role, language: user.language, avatar: user.avatar, background: user.background, stars: user.stars || 0, house_points: user.house_points || 0, createdAt: user.createdAt };
}

function generateToken(user) {
  return jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
}

app.post('/api/auth/signup', (req, res) => {
  const { username, password, role, language, avatar, background } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  if (findUser({ username })) return res.status(400).json({ error: 'Username already taken' });
  const hashed = bcrypt.hashSync(password, 10);
  const user = { id: uuidv4(), username, password: hashed, role: role || 'student', language: language || 'english', avatar: avatar || '👨‍🍳', background: background || 'ocean', stars: 0, house_points: 0, createdAt: new Date().toISOString() };
  data.users.push(user);
  saveData();
  const token = generateToken(user);
  res.json({ token, user: sanitizeUser(user) });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  const user = findUser({ username });
  if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' });
  const token = generateToken(user);
  res.json({ token, user: sanitizeUser(user) });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = findUser({ id: req.user.id });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(sanitizeUser(user));
});

app.put('/api/auth/profile', authMiddleware, (req, res) => {
  const { avatar, background, language, username } = req.body;
  const user = findUser({ id: req.user.id });
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (username) {
    const existing = data.users.find(u => u.username === username && u.id !== req.user.id);
    if (existing) return res.status(400).json({ error: 'Username taken' });
    user.username = username;
  }
  if (avatar) user.avatar = avatar;
  if (background) user.background = background;
  if (language) user.language = language;
  saveData();
  res.json(sanitizeUser(user));
});

app.get('/api/users', authMiddleware, (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Teachers only' });
  res.json(data.users.map(sanitizeUser));
});

app.put('/api/users/:id/points', authMiddleware, (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Teachers only' });
  const user = findUser({ id: req.params.id });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { stars, house_points } = req.body;
  if (stars) user.stars = (user.stars || 0) + stars;
  if (house_points) user.house_points = (user.house_points || 0) + house_points;
  const hpFromStars = Math.floor((user.stars || 0) / 30);
  saveData();
  res.json(sanitizeUser(user));
});

app.get('/api/leaderboard', authMiddleware, (req, res) => {
  const students = data.users.filter(u => u.role === 'student');
  students.sort((a, b) => (b.house_points || 0) - (a.house_points || 0) || (b.stars || 0) - (a.stars || 0));
  res.json(students.slice(0, 50).map((u, i) => ({ rank: i + 1, ...sanitizeUser(u) })));
});

const quizData = {
  math: {
    1: [
      { id: 'm1-1', question: 'What is 2 + 3?', options: ['4', '5', '6', '7'], answer: 1, points: 5 },
      { id: 'm1-2', question: 'What is 10 - 4?', options: ['5', '6', '7', '8'], answer: 1, points: 5 },
      { id: 'm1-3', question: 'What shape has 3 sides?', options: ['Square', 'Circle', 'Triangle', 'Rectangle'], answer: 2, points: 5 },
      { id: 'm1-4', question: 'What is 5 + 5?', options: ['8', '9', '10', '11'], answer: 2, points: 5 },
      { id: 'm1-5', question: 'Count the ducks: 🦆🦆🦆🦆 how many?', options: ['3', '4', '5', '6'], answer: 1, points: 5 },
      { id: 'm1-6', question: 'What is 8 - 3?', options: ['4', '5', '6', '7'], answer: 1, points: 5 },
      { id: 'm1-7', question: 'Which is bigger: 7 or 12?', options: ['7', '12', 'Same', 'None'], answer: 1, points: 5 },
      { id: 'm1-8', question: 'What is 3 + 4?', options: ['6', '7', '8', '9'], answer: 1, points: 5 },
      { id: 'm1-9', question: 'How many legs does a dog have?', options: ['2', '4', '6', '8'], answer: 1, points: 5 },
      { id: 'm1-10', question: 'What is 9 - 5?', options: ['3', '4', '5', '6'], answer: 1, points: 5 }
    ],
    2: [
      { id: 'm2-1', question: 'What is 12 + 7?', options: ['17', '18', '19', '20'], answer: 2, points: 5 },
      { id: 'm2-2', question: 'What is 20 - 8?', options: ['10', '11', '12', '13'], answer: 2, points: 5 },
      { id: 'm2-3', question: 'What is 3 x 4?', options: ['10', '11', '12', '13'], answer: 2, points: 5 },
      { id: 'm2-4', question: 'What is 15 ÷ 3?', options: ['3', '4', '5', '6'], answer: 2, points: 5 },
      { id: 'm2-5', question: 'What is 25 + 16?', options: ['39', '40', '41', '42'], answer: 2, points: 5 },
      { id: 'm2-6', question: 'What is 30 - 12?', options: ['16', '17', '18', '19'], answer: 2, points: 5 },
      { id: 'm2-7', question: 'What is 6 x 2?', options: ['10', '11', '12', '13'], answer: 2, points: 5 },
      { id: 'm2-8', question: 'How many sides does a hexagon have?', options: ['4', '5', '6', '7'], answer: 2, points: 5 },
      { id: 'm2-9', question: 'What is 100 - 45?', options: ['45', '55', '65', '75'], answer: 1, points: 5 },
      { id: 'm2-10', question: 'What is 8 x 3?', options: ['21', '22', '23', '24'], answer: 3, points: 5 }
    ]
  },
  russian: {
    1: [
      { id: 'r1-1', question: 'Какой первый месяц года?', options: ['Февраль', 'Март', 'Январь', 'Апрель'], answer: 2, points: 5 },
      { id: 'r1-2', question: 'Сколько букв в слове "кот"?', options: ['2', '3', '4', '5'], answer: 1, points: 5 },
      { id: 'r1-3', question: 'Какого цвета снег?', options: ['Красный', 'Синий', 'Белый', 'Зелёный'], answer: 2, points: 5 },
      { id: 'r1-4', question: 'Кто говорит "гав-гав"?', options: ['Кошка', 'Собака', 'Корова', 'Петух'], answer: 1, points: 5 },
      { id: 'r1-5', question: 'Что растёт на небе?', options: ['Цветы', 'Деревья', 'Звёзды', 'Трава'], answer: 2, points: 5 },
      { id: 'r1-6', question: 'Какой сегодня день?', options: ['Вчера', 'Сегодня', 'Завтра', 'Никогда'], answer: 1, points: 5 },
      { id: 'r1-7', question: 'Сколько глаз у человека?', options: ['1', '2', '3', '4'], answer: 1, points: 5 },
      { id: 'r1-8', question: 'Чем мы едим суп?', options: ['Вилкой', 'Ложкой', 'Ножом', 'Руками'], answer: 1, points: 5 },
      { id: 'r1-9', question: 'Какое животное даёт молоко?', options: ['Собака', 'Кошка', 'Корова', 'Лиса'], answer: 2, points: 5 },
      { id: 'r1-10', question: 'Что светит днём?', options: ['Луна', 'Солнце', 'Звёзды', 'Облака'], answer: 1, points: 5 }
    ],
    2: [
      { id: 'r2-1', question: 'Как правильно: "Я ... в школу"?', options: ['иду', 'идешь', 'идет', 'идем'], answer: 0, points: 5 },
      { id: 'r2-2', question: 'Сколько букв в русском алфавите?', options: ['30', '31', '32', '33'], answer: 3, points: 5 },
      { id: 'r2-3', question: 'Какой падеж у слова "книга" в предложении "Я читаю книгу"?', options: ['Именительный', 'Родительный', 'Дательный', 'Винительный'], answer: 3, points: 5 },
      { id: 'r2-4', question: 'Какое слово лишнее?', options: ['Синий', 'Красный', 'Бегать', 'Зелёный'], answer: 2, points: 5 },
      { id: 'r2-5', question: 'Что такое "существительное"?', options: ['Действие', 'Предмет', 'Признак', 'Число'], answer: 1, points: 5 },
      { id: 'r2-6', question: 'Как пишется "мороженое"?', options: ['мараженое', 'мороженое', 'марозеное', 'мароженое'], answer: 1, points: 5 },
      { id: 'r2-7', question: 'Сколько слогов в слове "молоко"?', options: ['2', '3', '4', '5'], answer: 1, points: 5 },
      { id: 'r2-8', question: 'Какое слово начинается с гласной?', options: ['Школа', 'Арбуз', 'Книга', 'Стол'], answer: 1, points: 5 },
      { id: 'r2-9', question: '"Большой" - это какой?', options: ['Маленький', 'Огромный', 'Красивый', 'Быстрый'], answer: 1, points: 5 },
      { id: 'r2-10', question: 'Как правильно: "У меня ... книга"?', options: ['есть', 'ешь', 'ест', 'едим'], answer: 0, points: 5 }
    ]
  },
  english: {
    1: [
      { id: 'e1-1', question: 'What is the first letter of the alphabet?', options: ['B', 'A', 'C', 'D'], answer: 1, points: 5 },
      { id: 'e1-2', question: 'What color is the sky?', options: ['Red', 'Blue', 'Green', 'Yellow'], answer: 1, points: 5 },
      { id: 'e1-3', question: 'How do you say "привет" in English?', options: ['Goodbye', 'Hello', 'Yes', 'No'], answer: 1, points: 5 },
      { id: 'e1-4', question: 'What animal says "moo"?', options: ['Dog', 'Cat', 'Cow', 'Duck'], answer: 2, points: 5 },
      { id: 'e1-5', question: 'How many fingers on one hand?', options: ['3', '4', '5', '6'], answer: 2, points: 5 },
      { id: 'e1-6', question: 'What is the opposite of "big"?', options: ['Tall', 'Small', 'Wide', 'Long'], answer: 1, points: 5 },
      { id: 'e1-7', question: 'What do you wear on your feet?', options: ['Hat', 'Shoes', 'Gloves', 'Scarf'], answer: 1, points: 5 },
      { id: 'e1-8', question: 'What is "cat" in Russian?', options: ['Собака', 'Кошка', 'Корова', 'Птица'], answer: 1, points: 5 },
      { id: 'e1-9', question: 'What color is a banana?', options: ['Red', 'Blue', 'Yellow', 'Green'], answer: 2, points: 5 },
      { id: 'e1-10', question: 'How do you say "спасибо" in English?', options: ['Please', 'Sorry', 'Thank you', 'Hello'], answer: 2, points: 5 }
    ],
    2: [
      { id: 'e2-1', question: 'What is the past tense of "go"?', options: ['Goed', 'Went', 'Gone', 'Going'], answer: 1, points: 5 },
      { id: 'e2-2', question: 'Which sentence is correct?', options: ['He go to school', 'He goes to school', 'He going school', 'He to school'], answer: 1, points: 5 },
      { id: 'e2-3', question: 'What does "beautiful" mean?', options: ['Уродливый', 'Красивый', 'Большой', 'Маленький'], answer: 1, points: 5 },
      { id: 'e2-4', question: 'What is the plural of "child"?', options: ['Childs', 'Childes', 'Children', 'Childrens'], answer: 2, points: 5 },
      { id: 'e2-5', question: 'Which word is a verb?', options: ['Table', 'Run', 'Happy', 'Book'], answer: 1, points: 5 },
      { id: 'e2-6', question: 'What is "яблоко" in English?', options: ['Orange', 'Banana', 'Apple', 'Grape'], answer: 2, points: 5 },
      { id: 'e2-7', question: 'Fill in: "She ___ a teacher"', options: ['am', 'is', 'are', 'be'], answer: 1, points: 5 },
      { id: 'e2-8', question: 'What is the opposite of "hot"?', options: ['Warm', 'Cold', 'Cool', 'Freezing'], answer: 1, points: 5 },
      { id: 'e2-9', question: 'How many days in a week?', options: ['5', '6', '7', '8'], answer: 2, points: 5 },
      { id: 'e2-10', question: 'Which is a fruit?', options: ['Carrot', 'Potato', 'Strawberry', 'Bread'], answer: 2, points: 5 }
    ]
  }
};

app.get('/api/quizzes/:subject/:year', authMiddleware, (req, res) => {
  const quizzes = quizData[req.params.subject]?.[req.params.year];
  if (!quizzes) return res.status(404).json({ error: 'Not found' });
  res.json(quizzes);
});

app.post('/api/quizzes/submit', authMiddleware, (req, res) => {
  const { subject, year, score, total } = req.body;
  const user = findUser({ id: req.user.id });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const id = uuidv4();
  data.quizScores.push({ id, userId: req.user.id, subject, year, score, total, completedAt: new Date().toISOString() });
  const starsEarned = Math.round((score / total) * 10);
  const oldStars = user.stars || 0;
  user.stars = oldStars + starsEarned;
  const oldHP = Math.floor(oldStars / 30);
  const newHP = Math.floor(user.stars / 30);
  const hpIncrease = user.house_points || 0;
  user.house_points = hpIncrease + (newHP - oldHP);
  saveData();
  res.json({ id, starsEarned, newStars: user.stars, hpIncrease: newHP - oldHP });
});

app.get('/api/scores', authMiddleware, (req, res) => {
  const quizzes = data.quizScores.filter(s => s.userId === req.user.id).sort((a, b) => b.completedAt?.localeCompare(a.completedAt));
  const games = data.gameScores.filter(s => s.userId === req.user.id).sort((a, b) => b.playedAt?.localeCompare(a.playedAt));
  res.json({ quizzes, games });
});

app.get('/api/announcements', authMiddleware, (req, res) => {
  res.json(data.announcements.sort((a, b) => b.createdAt?.localeCompare(a.createdAt)));
});

app.post('/api/announcements', authMiddleware, (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Teachers only' });
  const { title, content, priority } = req.body;
  const ann = { id: uuidv4(), teacherId: req.user.id, title, content, priority: priority || 'normal', createdAt: new Date().toISOString() };
  data.announcements.push(ann);
  saveData();
  io.emit('announcement', ann);
  res.json(ann);
});

app.delete('/api/announcements/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Teachers only' });
  data.announcements = data.announcements.filter(a => a.id !== req.params.id);
  saveData();
  res.json({ success: true });
});

app.post('/api/games/score', authMiddleware, (req, res) => {
  const { game, score } = req.body;
  const user = findUser({ id: req.user.id });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const id = uuidv4();
  data.gameScores.push({ id, userId: req.user.id, game, score, playedAt: new Date().toISOString() });
  const starsEarned = Math.max(1, Math.floor(score / 10));
  const oldStars = user.stars || 0;
  user.stars = oldStars + starsEarned;
  const oldHP = Math.floor(oldStars / 30);
  const newHP = Math.floor(user.stars / 30);
  user.house_points = (user.house_points || 0) + (newHP - oldHP);
  saveData();
  res.json({ id, starsEarned, hpIncrease: newHP - oldHP });
});

const islandPlayers = {};

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);
  socket.on('join-island', (joinData) => {
    const { island, username, userId, avatar } = joinData;
    socket.join(island);
    socket.island = island;
    socket.username = username;
    socket.userId = userId;
    if (!islandPlayers[island]) islandPlayers[island] = {};
    islandPlayers[island][socket.id] = { id: socket.id, username, userId, avatar, x: Math.random() * 700 + 50, y: Math.random() * 400 + 50 };
    io.to(island).emit('island-players', Object.values(islandPlayers[island]));
    io.to(island).emit('chat-message', { username: 'System', message: `${username} joined ${island}!`, avatar: '🌍', system: true });
    const msgs = (data.worldMessages || []).filter(m => m.island === island).slice(-20);
    socket.emit('chat-history', msgs);
  });
  socket.on('leave-island', () => {
    const island = socket.island;
    if (island && islandPlayers[island]) {
      delete islandPlayers[island][socket.id];
      io.to(island).emit('island-players', Object.values(islandPlayers[island]));
    }
    socket.island = null;
  });
  socket.on('player-move', (moveData) => {
    if (!socket.island || !islandPlayers[socket.island]) return;
    if (islandPlayers[socket.island][socket.id]) {
      islandPlayers[socket.island][socket.id].x = moveData.x;
      islandPlayers[socket.island][socket.id].y = moveData.y;
      islandPlayers[socket.island][socket.id].direction = moveData.direction;
      socket.to(socket.island).emit('player-moved', { id: socket.id, x: moveData.x, y: moveData.y, direction: moveData.direction });
    }
  });
  socket.on('chat-message', (msgData) => {
    if (!socket.island) return;
    const msg = { id: uuidv4(), userId: socket.userId, username: socket.username, avatar: '👨‍🍳', island: socket.island, message: msgData.message, createdAt: new Date().toISOString() };
    data.worldMessages.push(msg);
    saveData();
    io.to(socket.island).emit('chat-message', msg);
  });
  socket.on('send-highfive', () => {
    socket.to(socket.island).emit('highfive', { from: socket.username });
  });
  socket.on('explosion', (data) => {
    socket.to(socket.island).emit('explosion-effect', data);
  });
  socket.on('disconnect', () => {
    const island = socket.island;
    if (island && islandPlayers[island]) {
      delete islandPlayers[island][socket.id];
      io.to(island).emit('island-players', Object.values(islandPlayers[island]));
      io.to(island).emit('chat-message', { username: 'System', message: `${socket.username} left ${island}`, avatar: '🌍', system: true });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`KidLearn server running on http://0.0.0.0:${PORT}`);
});
