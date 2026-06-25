let state = { user: null, token: null, currentPage: 'home', socket: null, currentIsland: null };
const API = window.location.origin;

function $(id) { return document.getElementById(id); }

document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initNav();
  initSettings();
  initAvatarStudio();
  initWorld();
  setTimeout(() => {
    $('splash-screen').classList.add('hidden');
    $('auth-screen').classList.remove('hidden');
  }, 2000);
  const savedToken = localStorage.getItem('kidlearn_token');
  if (savedToken) {
    state.token = savedToken;
    fetchUser(savedToken);
  }
});

function showToast(msg, duration = 3000) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), duration);
}

function sanitize(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

async function api(path, method = 'GET', body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (state.token) opts.headers['Authorization'] = `Bearer ${state.token}`;
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(API + path, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ============ AUTH ============
function initAuth() {
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
      tab.classList.add('active');
      $(`${tab.dataset.tab}-form`).classList.add('active');
    });
  });
  document.querySelectorAll('.avatar-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.avatar-option').forEach(a => a.classList.remove('selected'));
      opt.classList.add('selected');
    });
  });
  document.querySelectorAll('.bg-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.bg-option').forEach(b => b.classList.remove('selected'));
      opt.classList.add('selected');
    });
  });
  $('login-btn').addEventListener('click', login);
  $('signup-btn').addEventListener('click', signup);
  $('login-username').addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
  $('login-password').addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
}

async function login() {
  const username = $('login-username').value.trim();
  const password = $('login-password').value.trim();
  if (!username || !password) { $('login-error').textContent = 'Please fill in all fields'; return; }
  try {
    const data = await api('/api/auth/login', 'POST', { username, password });
    state.token = data.token;
    state.user = data.user;
    localStorage.setItem('kidlearn_token', data.token);
    enterDashboard(data.user);
  } catch (e) {
    $('login-error').textContent = e.message;
  }
}

async function signup() {
  const username = $('signup-username').value.trim();
  const password = $('signup-password').value.trim();
  const language = $('signup-language').value;
  const role = $('signup-role').value;
  const avatar = document.querySelector('.avatar-option.selected')?.dataset.avatar || '👨‍🍳';
  const background = document.querySelector('.bg-option.selected')?.dataset.bg || 'ocean';
  if (!username || !password) { $('signup-error').textContent = 'Please fill in all fields'; return; }
  if (password.length < 4) { $('signup-error').textContent = 'Password must be at least 4 characters'; return; }
  try {
    const data = await api('/api/auth/signup', 'POST', { username, password, role, language, avatar, background });
    state.token = data.token;
    state.user = data.user;
    localStorage.setItem('kidlearn_token', data.token);
    enterDashboard(data.user);
  } catch (e) {
    $('signup-error').textContent = e.message;
  }
}

async function fetchUser(token) {
  try {
    const user = await api('/api/auth/me');
    state.user = user;
    enterDashboard(user);
  } catch { localStorage.removeItem('kidlearn_token'); }
}

function enterDashboard(user) {
  $('auth-screen').classList.add('hidden');
  $('dashboard-screen').classList.remove('hidden');
  state.user = user;
  updateUI(user);
  navigateTo('home');
  if (user.role === 'teacher') {
    document.querySelectorAll('.teacher-nav').forEach(el => el.classList.remove('hidden'));
  }
  connectSocket();
  loadAnnouncements();
}

function updateUI(user) {
  document.querySelectorAll('#sidebar-name, #welcome-name, #sidebar-name').forEach(el => { if (el) el.textContent = sanitize(user.username); });
  const avatar = user.avatar || '👨‍🍳';
  document.querySelectorAll('#sidebar-avatar, #topbar-avatar').forEach(el => { if (el) el.textContent = avatar; });
  $('sidebar-role').textContent = user.role === 'teacher' ? '👨‍🏫 Teacher' : '🎒 Student';
  const stars = user.stars || 0;
  const hp = user.house_points || 0;
  document.querySelectorAll('#sidebar-stars, #topbar-stars, #home-stars').forEach(el => { if (el) el.textContent = stars; });
  document.querySelectorAll('#sidebar-hp, #topbar-hp, #home-hp').forEach(el => { if (el) el.textContent = hp; });
  const bg = user.background || 'ocean';
  const bgMap = { ocean: 'linear-gradient(135deg, #0a0a1a, #001233)', forest: 'linear-gradient(135deg, #0a0a1a, #0d2818)', space: 'linear-gradient(135deg, #0a0a1a, #1a0033)', sunset: 'linear-gradient(135deg, #0a0a1a, #2d1b00)', candy: 'linear-gradient(135deg, #0a0a1a, #2d0020)', galaxy: 'linear-gradient(135deg, #0a0a1a, #0f0c29)' };
  document.body.style.background = bgMap[bg] || bgMap.ocean;
}

async function loadAnnouncements() {
  try {
    const anns = await api('/api/announcements');
    const list = $('announcements-list');
    list.innerHTML = anns.map(a => `
      <div class="announcement-card ${a.priority}">
        <div class="announcement-header">
          <span class="announcement-title">${sanitize(a.title)}</span>
          <span class="announcement-priority ${a.priority}">${a.priority === 'urgent' ? '🚨' : a.priority === 'important' ? '🔴' : a.priority === 'fun' ? '🎉' : '📌'} ${a.priority}</span>
        </div>
        <div class="announcement-content">${sanitize(a.content)}</div>
        <div class="announcement-time">${new Date(a.created_at || a.createdAt).toLocaleDateString()}</div>
      </div>
    `).join('');
  } catch {}
}

// ============ NAVIGATION ============
function initNav() {
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', () => navigateTo(item.dataset.page));
  });
  $('hamburger').addEventListener('click', () => $('sidebar').classList.toggle('open'));
  $('logout-btn').addEventListener('click', logout);
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && !e.target.closest('.sidebar') && !e.target.closest('.hamburger')) {
      $('sidebar').classList.remove('open');
    }
  });
}

function navigateTo(page) {
  state.currentPage = page;
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll(`.nav-item[data-page="${page}"]`).forEach(n => n.classList.add('active'));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = $(`page-${page}`);
  if (target) target.classList.add('active');
  const titles = { home:'🏠 Home', subjects:'📚 Subjects', quizzes:'📝 Quizzes', games:'🎮 Games', world:'🌍 World Islands', leaderboard:'🏆 Leaderboard', settings:'⚙️ Settings', 'teacher-dashboard':'📊 Teacher Dashboard', 'teacher-students':'👥 Students', 'teacher-announce':'📢 Announcements' };
  $('topbar-title').textContent = titles[page] || '🏠 Home';
  $('sidebar').classList.remove('open');
  if (page === 'home') loadHomeData();
  if (page === 'quizzes') showQuizSelect();
  if (page === 'leaderboard') loadLeaderboard('hp');
  if (page === 'world') { if (state.currentIsland) joinIsland(state.currentIsland); }
  if (page === 'teacher-students') loadTeacherStudents();
  if (page === 'teacher-dashboard') loadTeacherDashboard();
  if (page === 'teacher-announce') loadTeacherAnnouncements();
  if (page === 'subjects') loadQuizGrid();
}

async function loadHomeData() {
  try {
    const data = await api('/api/scores');
    $('home-quizzes').textContent = data.quizzes.length;
  } catch {}
  loadAnnouncements();
}

function logout() {
  if (state.socket) state.socket.disconnect();
  state.token = null;
  state.user = null;
  localStorage.removeItem('kidlearn_token');
  $('dashboard-screen').classList.add('hidden');
  $('auth-screen').classList.remove('hidden');
  document.querySelectorAll('.teacher-nav').forEach(el => el.classList.add('hidden'));
}

// ============ QUIZZES ============
function loadQuizGrid() {
  const grid = $('quiz-grid');
  const subjects = [
    { key:'math', icon:'🔢', name:'Mathematics', years:[1,2] },
    { key:'russian', icon:'🇷🇺', name:'Russian', years:[1,2] },
    { key:'english', icon:'🇬🇧', name:'English', years:[1,2] }
  ];
  grid.innerHTML = subjects.map(s => s.years.map(y => `
    <div class="quiz-card" onclick="startQuiz('${s.key}',${y})">
      <div class="quiz-card-icon">${s.icon}</div>
      <h3>${s.name}</h3>
      <p>Year ${y}</p>
    </div>
  `).join('')).join('');
}

function showQuizSelect() {
  $('quiz-select').classList.remove('hidden');
  $('quiz-active').classList.add('hidden');
  $('quiz-result').classList.add('hidden');
  loadQuizGrid();
}

let quizState = { questions: [], current: 0, score: 0, answers: [] };

async function startQuiz(subject, year) {
  try {
    const questions = await api(`/api/quizzes/${subject}/${year}`);
    quizState = { questions, current: 0, score: 0, answers: [] };
    $('quiz-select').classList.add('hidden');
    $('quiz-active').classList.remove('hidden');
    $('quiz-result').classList.add('hidden');
    $('quiz-title').textContent = `${subject === 'math' ? '🔢' : subject === 'russian' ? '🇷🇺' : '🇬🇧'} ${subject.charAt(0).toUpperCase()+subject.slice(1)} - Year ${year}`;
    $('quiz-total').textContent = questions.length;
    showQuestion();
  } catch { showToast('Failed to load quiz'); }
}

function showQuestion() {
  const q = quizState.questions[quizState.current];
  if (!q) return finishQuiz();
  $('quiz-current').textContent = quizState.current + 1;
  $('quiz-progress-fill').style.width = `${((quizState.current) / quizState.questions.length) * 100}%`;
  $('quiz-question').textContent = q.question;
  $('quiz-score-display').textContent = `⭐ ${quizState.score}`;
  const opts = $('quiz-options');
  opts.innerHTML = q.options.map((o, i) => `
    <button class="quiz-option ${quizState.answers[quizState.current] === i ? 'selected' : ''}"
      onclick="selectAnswer(${i})" ${quizState.answers[quizState.current] !== undefined ? 'disabled' : ''}>
      ${sanitize(o)}
    </button>
  `).join('');
  $('quiz-prev').disabled = quizState.current === 0;
  const nextBtn = $('quiz-next');
  if (quizState.current === quizState.questions.length - 1) {
    nextBtn.textContent = quizState.answers[quizState.current] !== undefined ? 'Finish ✅' : 'Finish';
  } else {
    nextBtn.textContent = quizState.answers[quizState.current] !== undefined ? 'Next →' : 'Skip →';
  }
}

function selectAnswer(index) {
  const q = quizState.questions[quizState.current];
  if (quizState.answers[quizState.current] !== undefined) return;
  quizState.answers[quizState.current] = index;
  if (index === q.answer) quizState.score += q.points || 5;
  showQuestion();
  document.querySelectorAll('.quiz-option').forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.answer) btn.classList.add('correct');
    else if (i === index && index !== q.answer) btn.classList.add('wrong');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  $('quiz-prev').addEventListener('click', () => {
    if (quizState.current > 0) { quizState.current--; showQuestion(); }
  });
  $('quiz-next').addEventListener('click', () => {
    if (quizState.current < quizState.questions.length - 1) { quizState.current++; showQuestion(); }
    else if (quizState.answers[quizState.current] !== undefined) finishQuiz();
    else { quizState.current++; showQuestion(); }
  });
});

async function finishQuiz() {
  const total = quizState.questions.length;
  const correct = quizState.answers.filter((a, i) => a === quizState.questions[i]?.answer).length;
  const q = quizState.questions[0];
  const subject = q ? q.id.split('-')[0].replace(/[0-9]/g, '') : 'math';
  const year = q ? parseInt(q.id.split('-')[0].match(/\d+/)?.[0] || '1') : 1;
  try {
    const result = await api('/api/quizzes/submit', 'POST', { subject, year, score: correct, total });
    $('quiz-active').classList.add('hidden');
    $('quiz-result').classList.remove('hidden');
    const pct = Math.round((correct / total) * 100);
    $('result-icon').textContent = pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪';
    $('result-title').textContent = pct >= 80 ? 'Amazing Job!' : pct >= 50 ? 'Good Effort!' : 'Keep Trying!';
    $('result-score').textContent = `You scored ${correct}/${total}`;
    $('result-stars-msg').textContent = `⭐ +${result.starsEarned} stars earned!`;
    state.user.stars = result.newStars;
    if (result.hpIncrease > 0) state.user.house_points = (state.user.house_points || 0) + result.hpIncrease;
    updateUI(state.user);
  } catch { showToast('Failed to save score'); }
}

function showQuizResults() {
  navigateTo('leaderboard');
  backToQuizzes();
}

function backToQuizzes() {
  $('quiz-result').classList.add('hidden');
  $('quiz-select').classList.remove('hidden');
}

function startSubject(subject) {
  startQuiz(subject, 1);
}

// ============ GAMES ============
let gameState = { active: false, score: 0, timer: null };

const memoryEmojis = ['🍎','🍕','🚀','🌈','🐱','🦋','🎸','🍦'];

function startGame(type) {
  $('games-grid').classList.add('hidden');
  $('game-active').classList.remove('hidden');
  $('game-title').textContent = type === 'memory' ? '🧠 Memory Match' : type === 'mathrush' ? '🔢 Math Rush' : type === 'worddrop' ? '📝 Word Drop' : '🎨 Color Match';
  $('game-score').textContent = 'Score: 0';
  gameState = { active: true, score: 0, type };
  if (type === 'memory') startMemoryGame();
  else if (type === 'mathrush') startMathRush();
  else if (type === 'worddrop') startWordDrop();
  else if (type === 'colormatch') startColorMatch();
}

function exitGame() {
  gameState.active = false;
  if (gameState.timer) clearInterval(gameState.timer);
  $('game-active').classList.add('hidden');
  $('games-grid').classList.remove('hidden');
}

async function finishGame(type, score) {
  if (score > 0) {
    try {
      const result = await api('/api/games/score', 'POST', { game: type, score });
      showToast(`🎮 Game Over! Score: ${score} | ⭐ +${result.starsEarned} stars!`);
      state.user.stars = (state.user.stars || 0) + result.starsEarned;
      state.user.house_points = (state.user.house_points || 0) + result.hpIncrease;
      updateUI(state.user);
    } catch {}
  }
  exitGame();
}

function startMemoryGame() {
  const emojis = [...memoryEmojis, ...memoryEmojis];
  for (let i = emojis.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [emojis[i], emojis[j]] = [emojis[j], emojis[i]]; }
  let flipped = [], matched = [], lock = false;
  const area = $('game-area');
  area.innerHTML = `<div class="memory-grid">${emojis.map((e, i) => `<div class="memory-card" data-i="${i}" data-e="${e}">❓</div>`).join('')}</div>`;
  area.querySelectorAll('.memory-card').forEach(card => {
    card.addEventListener('click', () => {
      if (lock || flipped.length >= 2 || card.classList.contains('flipped') || card.classList.contains('matched')) return;
      card.textContent = card.dataset.e;
      card.classList.add('flipped');
      flipped.push(card);
      if (flipped.length === 2) {
        lock = true;
        if (flipped[0].dataset.e === flipped[1].dataset.e) {
          flipped.forEach(f => { f.classList.add('matched'); f.classList.remove('flipped'); });
          matched.push(...flipped);
          gameState.score += 10;
          $('game-score').textContent = `Score: ${gameState.score}`;
          flipped = []; lock = false;
          if (matched.length === emojis.length) finishGame('memory', gameState.score);
        } else {
          setTimeout(() => {
            flipped.forEach(f => { f.textContent = '❓'; f.classList.remove('flipped'); });
            flipped = []; lock = false;
          }, 800);
        }
      }
    });
  });
}

function startMathRush() {
  let correct = 0, total = 0, timeLeft = 30;
  const area = $('game-area');
  function newQuestion() {
    const a = Math.floor(Math.random() * 12) + 1, b = Math.floor(Math.random() * 12) + 1;
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * 3)];
    let ans;
    if (op === '+') ans = a + b;
    else if (op === '-') { if (a < b) { [a, b] = [b, a]; } ans = a - b; }
    else ans = a * b;
    const opts = [ans];
    while (opts.length < 4) { const r = ans + Math.floor(Math.random() * 10) - 5; if (!opts.includes(r) && r >= 0) opts.push(r); }
    for (let i = opts.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [opts[i], opts[j]] = [opts[j], opts[i]]; }
    area.innerHTML = `<div class="math-rush-game">
      <div class="math-rush-timer">⏱️ ${timeLeft}s</div>
      <div class="math-rush-question">${a} ${op} ${b} = ?</div>
      <div class="math-rush-options">${opts.map(o => `<button class="math-rush-btn" onclick="answerMathRush(${o}, ${ans})">${o}</button>`).join('')}</div>
      <p style="margin-top:16px;color:var(--text-secondary)">Correct: ${correct}/${total}</p>
    </div>`;
  }
  newQuestion();
  if (gameState.timer) clearInterval(gameState.timer);
  gameState.timer = setInterval(() => {
    timeLeft--;
    const timerEl = area.querySelector('.math-rush-timer');
    if (timerEl) timerEl.textContent = `⏱️ ${timeLeft}s`;
    if (timeLeft <= 0) { clearInterval(gameState.timer); finishGame('mathrush', correct * 10); }
  }, 1000);
  window.answerMathRush = (val, ans) => {
    total++;
    if (val === ans) correct++;
    gameState.score = correct * 10;
    $('game-score').textContent = `Score: ${gameState.score}`;
    newQuestion();
  };
}

function startWordDrop() {
  const words = ['CAT', 'DOG', 'SUN', 'BIG', 'RED', 'RUN', 'FUN', 'HAT', 'BED', 'TOP'];
  let current = words[Math.floor(Math.random() * words.length)];
  let shuffled = current.split('').sort(() => Math.random() - 0.5);
  let used = [];
  const area = $('game-area');
  function render() {
    area.innerHTML = `<div class="word-drop-game">
      <p style="color:var(--text-secondary);margin-bottom:8px;">Arrange the letters:</p>
      <div class="word-drop-target">${current.split('').map(l => used.includes(l) ? l : '_').join(' ')}</div>
      <div class="word-drop-letters">${shuffled.map((l, i) => `<div class="word-drop-letter ${used.includes(i) ? 'used' : ''}" data-i="${i}">${l}</div>`).join('')}</div>
      <p style="margin-top:12px;color:var(--text-secondary)">Score: ${gameState.score}</p>
    </div>`;
    area.querySelectorAll('.word-drop-letter:not(.used)').forEach(el => {
      el.addEventListener('click', () => {
        const i = parseInt(el.dataset.i);
        const nextIdx = used.length;
        if (shuffled[i] === current[nextIdx]) {
          used.push(i);
          gameState.score += 10;
          $('game-score').textContent = `Score: ${gameState.score}`;
          if (used.length === current.length) {
            gameState.score += 20;
            current = words[Math.floor(Math.random() * words.length)];
            shuffled = current.split('').sort(() => Math.random() - 0.5);
            used = [];
          }
          render();
        } else {
          showToast('Wrong letter! Try again.');
          gameState.score = Math.max(0, gameState.score - 2);
          $('game-score').textContent = `Score: ${gameState.score}`;
        }
      });
    });
  }
  render();
}

function startColorMatch() {
  const colors = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#ff6b9d','#c084fc','#fb923c','#22d3ee'];
  let current = colors[Math.floor(Math.random() * colors.length)];
  let round = 0;
  const area = $('game-area');
  function render() {
    const opts = [current];
    while (opts.length < 6) { const c = colors[Math.floor(Math.random() * colors.length)]; if (!opts.includes(c)) opts.push(c); }
    for (let i = opts.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [opts[i], opts[j]] = [opts[j], opts[i]]; }
    area.innerHTML = `<div class="color-match-game">
      <p style="color:var(--text-secondary);margin-bottom:12px;">Match the color!</p>
      <div class="color-match-target" style="background:${current}"></div>
      <div class="color-match-options">${opts.map(c => `<div class="color-match-opt" style="background:${c}" data-c="${c}"></div>`).join('')}</div>
      <p style="margin-top:12px;color:var(--text-secondary)">Score: ${gameState.score}</p>
    </div>`;
    area.querySelectorAll('.color-match-opt').forEach(el => {
      el.addEventListener('click', () => {
        if (el.dataset.c === current) {
          gameState.score += 10;
          $('game-score').textContent = `Score: ${gameState.score}`;
          round++;
          if (round >= 10) finishGame('colormatch', gameState.score);
          else { current = colors[Math.floor(Math.random() * colors.length)]; render(); }
        } else {
          gameState.score = Math.max(0, gameState.score - 2);
          $('game-score').textContent = `Score: ${gameState.score}`;
          showToast('Wrong color!');
        }
      });
    });
  }
  render();
}

// ============ WORLD ISLANDS ============
function initWorld() {
  $('world-chat-send').addEventListener('click', sendChatMessage);
  $('world-chat-input').addEventListener('keydown', e => { if (e.key === 'Enter') sendChatMessage(); });
}

function connectSocket() {
  if (state.socket) state.socket.disconnect();
  state.socket = io(API, { transports: ['websocket', 'polling'] });
  state.socket.on('connect', () => {});
  state.socket.on('island-players', (players) => {
    drawIslandPlayers(players);
    if (state.currentIsland) {
      const onlineEl = $(`online-${state.currentIsland}`);
      if (onlineEl) onlineEl.textContent = `🟢 ${players.length} online`;
      $('world-online-count').textContent = `${players.length} online`;
    }
  });
  state.socket.on('player-moved', (data) => {
    movePlayerOnCanvas(data.id, data.x, data.y, data.direction);
  });
  state.socket.on('chat-message', (msg) => {
    addChatMessage(msg);
  });
  state.socket.on('chat-history', (msgs) => {
    $('world-chat-msgs').innerHTML = '';
    msgs.forEach(m => addChatMessage(m));
  });
  state.socket.on('highfive', (data) => {
    showToast(`✋ ${data.from} high-fived ${data.to}!`);
  });
  state.socket.on('explosion-effect', (data) => {
    triggerExplosion(data);
  });
  state.socket.on('announcement', (ann) => {
    showToast(`📢 ${ann.title}`, 5000);
    loadAnnouncements();
  });
}

function joinIsland(island) {
  if (!state.socket || !state.socket.connected) { showToast('Connecting to server...'); return; }
  if (state.currentIsland) state.socket.emit('leave-island', { island: state.currentIsland });
  state.currentIsland = island;
  $('world-select').classList.add('hidden');
  $('world-active').classList.remove('hidden');
  $('world-island-name').textContent = island.charAt(0).toUpperCase() + island.slice(1) + ' Island';
  state.socket.emit('join-island', { island, username: state.user.username, userId: state.user.id, avatar: state.user.avatar });
  initCanvas();
  initIslandGames(island);
}

function leaveIsland() {
  if (state.socket) state.socket.emit('leave-island', { island: state.currentIsland });
  state.currentIsland = null;
  $('world-select').classList.remove('hidden');
  $('world-active').classList.add('hidden');
}

function sendChatMessage() {
  const input = $('world-chat-input');
  const msg = input.value.trim();
  if (!msg || !state.socket) return;
  state.socket.emit('chat-message', { message: msg });
  input.value = '';
}

function addChatMessage(msg) {
  const container = $('world-chat-msgs');
  const div = document.createElement('div');
  div.className = `world-chat-message ${msg.system ? 'system' : ''}`;
  div.innerHTML = msg.system
    ? `<span class="msg-text">${sanitize(msg.message)}</span>`
    : `<span class="msg-avatar">${msg.avatar || '👤'}</span><span class="msg-user">${sanitize(msg.username)}:</span> <span class="msg-text">${sanitize(msg.message)}</span>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function sendHighfive() {
  if (state.socket) state.socket.emit('send-highfive', { to: 'everyone' });
}

function sendExplosion() {
  if (state.socket) state.socket.emit('explosion', { x: Math.random() * 700, y: Math.random() * 400 });
}

function worldDance() {
  if (state.socket) state.socket.emit('player-move', { x: 400, y: 250, direction: 'dance' });
}

// Canvas for World Islands
let canvasCtx = null;
let canvasPlayers = {};

function initCanvas() {
  const canvas = $('world-canvas');
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  canvasCtx = canvas.getContext('2d');
  canvasPlayers = {};
  canvas.addEventListener('mousemove', (e) => {
    if (!state.currentIsland || !state.socket) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    state.socket.emit('player-move', { x, y, direction: 'walk' });
  });
  requestAnimationFrame(renderCanvas);
}

function drawIslandBackground(ctx, w, h) {
  const island = state.currentIsland;
  if (island === 'playground') { ctx.fillStyle = '#2d6a4f'; ctx.fillRect(0,0,w,h); drawTrees(ctx, w, h); }
  else if (island === 'adventure') { ctx.fillStyle = '#1a3a2a'; ctx.fillRect(0,0,w,h); drawMountains(ctx, w, h); }
  else if (island === 'dojo') { ctx.fillStyle = '#2c1810'; ctx.fillRect(0,0,w,h); drawDojo(ctx, w, h); }
  else if (island === 'space') { ctx.fillStyle = '#0a0a2e'; ctx.fillRect(0,0,w,h); drawStars(ctx, w, h); }
  else if (island === 'minecraft') { ctx.fillStyle = '#4a7c3f'; ctx.fillRect(0,0,w,h); drawBlocks(ctx, w, h); }
  else if (island === 'party') { ctx.fillStyle = '#2a1a4a'; ctx.fillRect(0,0,w,h); drawParty(ctx, w, h); }
  else { ctx.fillStyle = '#1a3a5c'; ctx.fillRect(0,0,w,h); }
}

function drawTrees(ctx, w, h) {
  ctx.fillStyle = '#1b4332';
  for (let i = 0; i < 8; i++) { const x = 80 + (i * 100); ctx.beginPath(); ctx.arc(x, h-40, 30, 0, Math.PI*2); ctx.fill(); }
  ctx.fillStyle = '#52b788';
  for (let i = 0; i < 5; i++) { const x = 50 + (i * 180); drawFlower(ctx, x, h-80); }
}

function drawMountains(ctx, w, h) {
  ctx.fillStyle = '#2d4a3a';
  ctx.beginPath(); ctx.moveTo(0,h); ctx.lineTo(150,h-150); ctx.lineTo(300,h); ctx.fill();
  ctx.beginPath(); ctx.moveTo(200,h); ctx.lineTo(400,h-200); ctx.lineTo(600,h); ctx.fill();
  ctx.beginPath(); ctx.moveTo(500,h); ctx.lineTo(700,h-120); ctx.lineTo(800,h); ctx.fill();
}

function drawDojo(ctx, w, h) {
  ctx.fillStyle = '#4a2c1a'; ctx.fillRect(w/2-60, h/2-60, 120, 120);
  ctx.fillStyle = '#6b3a2a'; ctx.fillRect(w/2-50, h/2-50, 100, 100);
  ctx.fillStyle = '#ffd700'; ctx.font = '24px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('🥋', w/2, h/2+8);
}

function drawStars(ctx, w, h) {
  for (let i = 0; i < 50; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random()*0.5+0.5})`;
    ctx.beginPath(); ctx.arc(Math.random()*w, Math.random()*h, Math.random()*2+1, 0, Math.PI*2); ctx.fill();
  }
}

function drawBlocks(ctx, w, h) {
  ctx.strokeStyle = '#5a9c4f'; ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 40) { for (let y = 0; y < h; y += 40) { ctx.strokeRect(x, y, 40, 40); } }
  ctx.fillStyle = '#6b4a2a'; ctx.fillRect(300, 200, 80, 80);
  ctx.fillStyle = '#8b6a4a'; ctx.fillRect(300, 200, 80, 10);
}

function drawParty(ctx, w, h) {
  const colors = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#c084fc'];
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = colors[i % colors.length];
    const x = Math.random()*w, y = Math.random()*h, s = Math.random()*8+4;
    ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI*2); ctx.fill();
  }
  ctx.font = '40px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('🎉', w/2-60, 60); ctx.fillText('🎊', w/2+60, 60);
}

function drawFlower(ctx, x, y) {
  ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI*2); ctx.fillStyle = '#ff6b9d'; ctx.fill();
  ctx.beginPath(); ctx.arc(x-6, y-6, 6, 0, Math.PI*2); ctx.fillStyle = '#ffd93d'; ctx.fill();
}

function drawIslandPlayers(players) {
  canvasPlayers = {};
  players.forEach(p => { canvasPlayers[p.id] = p; });
}

function movePlayerOnCanvas(id, x, y, direction) {
  if (canvasPlayers[id]) { canvasPlayers[id].x = x; canvasPlayers[id].y = y; canvasPlayers[id].direction = direction; }
}

function renderCanvas() {
  const canvas = $('world-canvas');
  if (!canvas || !canvasCtx) return;
  const ctx = canvasCtx;
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  drawIslandBackground(ctx, w, h);
  Object.values(canvasPlayers).forEach(p => {
    ctx.font = '32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(p.avatar || '👤', p.x, p.y);
    ctx.font = '12px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText(p.username || '', p.x, p.y + 20);
  });
  requestAnimationFrame(renderCanvas);
}

function triggerExplosion(data) {
  showToast('💥 BOOM!');
}

function initIslandGames(island) {}

// ============ LEADERBOARD ============
let leaderboardData = [];

async function loadLeaderboard(sort = 'hp') {
  try {
    const data = await api('/api/leaderboard');
    leaderboardData = data;
    sortLeaderboard(sort);
  } catch { showToast('Failed to load leaderboard'); }
}

function sortLeaderboard(sort) {
  document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.sort-btn[data-sort="${sort}"]`)?.classList.add('active');
  const sorted = [...leaderboardData].sort((a, b) => sort === 'hp' ? b.house_points - a.house_points : b.stars - a.stars);
  const list = $('leaderboard-list');
  list.innerHTML = sorted.map((u, i) => {
    const cls = i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : '';
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
    return `<div class="leaderboard-item ${cls}">
      <span class="leaderboad-rank">${medal}</span>
      <span class="leaderboad-avatar">${u.avatar || '👤'}</span>
      <span class="leaderboad-name">${sanitize(u.username)}</span>
      <div class="leaderboad-stats">
        <span class="leaderboad-stat stars">⭐ ${u.stars}</span>
        <span class="leaderboad-stat hp">🏆 ${u.house_points}</span>
      </div>
    </div>`;
  }).join('');
}

// ============ SETTINGS ============
function initSettings() {
  $('settings-language').addEventListener('change', () => {});
}

function saveProfile() {
  const username = $('settings-username').value.trim();
  const language = $('settings-language').value;
  if (!username) { showToast('Username cannot be empty'); return; }
  api('/api/auth/profile', 'PUT', { username, language }).then(user => {
    state.user = user;
    updateUI(user);
    showToast('Profile saved! ✅');
  }).catch(e => showToast(e.message));
}

function saveAvatar() {
  const avatar = document.querySelector('.avatar-opt.active')?.textContent || state.user?.avatar || '👨‍🍳';
  api('/api/auth/profile', 'PUT', { avatar }).then(user => {
    state.user = user;
    updateUI(user);
    showToast('Avatar saved! ✅');
  }).catch(e => showToast(e.message));
}

function saveBackground() {
  const bg = document.querySelector('.bg-options-settings .bg-option.selected')?.dataset.bg || state.user?.background || 'ocean';
  api('/api/auth/profile', 'PUT', { background: bg }).then(user => {
    state.user = user;
    updateUI(user);
    showToast('Theme saved! ✅');
  }).catch(e => showToast(e.message));
}

// Avatar Studio
const avatarEmojis = {
  faces: ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','😊','😇','🥰','😍','🤩','😘','😋','😛','🤑','🤗','🤭','🙃','😎','🤓','🧐','😜','😝','🫡','🤠'],
  outfits: ['👨‍🍳','👩‍🍳','🧑‍🚀','👨‍🚀','👩‍🚀','👨‍🔬','👩‍🔬','👨‍🎓','👩‍🎓','👨‍🏫','👩‍🏫','👨‍⚕️','👩‍⚕️','👨‍🎤','👩‍🎤','👨‍🎨','👩‍🎨','👨‍🌾','👩‍🌾','🦸‍♂️','🦸‍♀️','🧙‍♂️','🧙‍♀️','🧚‍♂️','🧚‍♀️','🧛‍♂️','🧛‍♀️'],
  accessories: ['👑','🎒','🎓','🕶️','🧢','🎩','⛑️','👒','🎧','📿','💍','⌚','🧤','🧣','👔','👗'],
  animals: ['🐱','🐶','🐰','🦊','🐼','🐨','🐸','🐻','🐷','🦁','🐯','🐮','🦄','🐧','🐥','🐙','🦋','🐞','🐝','🦉','🦅','🐺','🐲'],
  food: ['🍎','🍕','🍔','🌮','🍦','🍩','🍪','🎂','🍫','🍿','🥨','🧁','🍭','🍬','🍉','🍇','🍓','🥑','🌽','🥕']
};

function initAvatarStudio() {
  document.querySelectorAll('.avatar-cat').forEach(cat => {
    cat.addEventListener('click', () => {
      document.querySelectorAll('.avatar-cat').forEach(c => c.classList.remove('active'));
      cat.classList.add('active');
      showAvatarOptions(cat.dataset.cat);
    });
  });
  showAvatarOptions('faces');
  loadBackgroundOptions();
  if (state.user) {
    $('settings-username').value = state.user.username || '';
    $('settings-language').value = state.user.language || 'english';
  }
}

function showAvatarOptions(category) {
  const grid = $('avatar-options-grid');
  const emojis = avatarEmojis[category] || avatarEmojis.faces;
  grid.innerHTML = emojis.map(e => `<span class="avatar-opt ${state.user?.avatar === e ? 'active' : ''}" onclick="selectAvatarOpt(this, '${e}')">${e}</span>`).join('');
  document.querySelectorAll('.avatar-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.avatar-opt').forEach(a => a.classList.remove('active'));
      opt.classList.add('active');
      $('avatar-preview').textContent = opt.textContent;
    });
  });
}

function selectAvatarOpt(el, emoji) {
  document.querySelectorAll('.avatar-opt').forEach(a => a.classList.remove('active'));
  el.classList.add('active');
  $('avatar-preview').textContent = emoji;
}

function loadBackgroundOptions() {
  const container = $('bg-options-settings');
  const options = [
    { bg:'ocean', style:'linear-gradient(135deg, #00b4d8, #0077b6)', label:'🌊 Ocean' },
    { bg:'forest', style:'linear-gradient(135deg, #2d6a4f, #52b788)', label:'🌲 Forest' },
    { bg:'space', style:'linear-gradient(135deg, #240046, #7b2cbf)', label:'🚀 Space' },
    { bg:'sunset', style:'linear-gradient(135deg, #f77f00, #fcbf49)', label:'🌅 Sunset' },
    { bg:'candy', style:'linear-gradient(135deg, #ff006e, #fb5607)', label:'🍬 Candy' },
    { bg:'galaxy', style:'linear-gradient(135deg, #0f0c29, #302b63)', label:'🌌 Galaxy' }
  ];
  container.innerHTML = options.map(o => `
    <div class="bg-option ${state.user?.background === o.bg ? 'selected' : ''}" data-bg="${o.bg}" style="background:${o.style}" onclick="selectBgSetting(this, '${o.bg}')">${o.label}</div>
  `).join('');
}

function selectBgSetting(el, bg) {
  document.querySelectorAll('.bg-options-settings .bg-option').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
}

// ============ TEACHER ============
async function loadTeacherDashboard() {
  try {
    const users = await api('/api/users');
    const students = users.filter(u => u.role === 'student');
    $('teacher-total-students').textContent = students.length;
    const totalStars = students.reduce((s, u) => s + (u.stars || 0), 0);
    const totalHP = students.reduce((s, u) => s + (u.house_points || 0), 0);
    $('teacher-total-stars').textContent = totalStars;
    $('teacher-total-hp').textContent = totalHP;
    try {
      const data = await api('/api/scores');
      const quizzes = data.quizzes || [];
      $('teacher-total-quizzes').textContent = quizzes.length;
    } catch { $('teacher-total-quizzes').textContent = '?'; }
    const recent = $('teacher-recent');
    const topStudents = students.sort((a, b) => b.house_points - a.house_points).slice(0, 5);
    recent.innerHTML = `<h3>🏆 Top Students</h3>` + topStudents.map((u, i) => `
      <div class="leaderboard-item ${i===0?'top1':i===1?'top2':i===2?'top3':''}">
        <span class="leaderboad-rank">${i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}</span>
        <span class="leaderboad-avatar">${u.avatar || '👤'}</span>
        <span class="leaderboad-name">${sanitize(u.username)}</span>
        <div class="leaderboad-stats">
          <span class="leaderboad-stat stars">⭐ ${u.stars}</span>
          <span class="leaderboad-stat hp">🏆 ${u.house_points}</span>
        </div>
      </div>
    `).join('');
  } catch {}
}

async function loadTeacherStudents() {
  try {
    const users = await api('/api/users');
    const students = users.filter(u => u.role === 'student');
    const searchEl = $('teacher-search');
    function render(filter = '') {
      const filtered = students.filter(u => u.username.toLowerCase().includes(filter.toLowerCase()));
      $('teacher-students-body').innerHTML = filtered.map(u => `
        <tr>
          <td style="font-size:28px;">${u.avatar || '👤'}</td>
          <td><strong>${sanitize(u.username)}</strong></td>
          <td>${u.language === 'russian' ? '🇷🇺' : '🇬🇧'}</td>
          <td>⭐ ${u.stars}</td>
          <td>🏆 ${u.house_points}</td>
          <td>
            <input type="number" class="teacher-points-input" id="points-${u.id}" placeholder="Stars" min="0" max="100">
            <button class="teacher-points-btn" onclick="givePoints('${u.id}')">Give ⭐</button>
            <button class="teacher-points-btn" style="background:var(--primary-light)" onclick="giveHP('${u.id}')">Give 🏆</button>
          </td>
        </tr>
      `).join('');
    }
    render();
    searchEl.addEventListener('input', () => render(searchEl.value));
  } catch {}
}

async function givePoints(userId) {
  const input = $(`points-${userId}`);
  const stars = parseInt(input.value) || 0;
  if (stars <= 0) { showToast('Enter a positive number'); return; }
  try {
    const result = await api(`/api/users/${userId}/points`, 'PUT', { stars });
    showToast(`✅ Gave ${stars}⭐ to ${result.username}!`);
    input.value = '';
    loadTeacherStudents();
    showToast(`🎉 ${result.username} received ${stars}⭐! (${result.house_points}🏆 total)`);
  } catch (e) { showToast(e.message); }
}

async function giveHP(userId) {
  const input = $(`points-${userId}`);
  const hp = parseFloat(input.value) || 0;
  if (hp <= 0) { showToast('Enter a positive number'); return; }
  try {
    const result = await api(`/api/users/${userId}/points`, 'PUT', { house_points: hp });
    showToast(`✅ Gave ${hp}🏆 to ${result.username}! (${result.house_points}🏆 total)`);
    input.value = '';
    loadTeacherStudents();
    showToast(`🎉 ${result.username} received ${hp}🏆 House Points!`);
  } catch (e) { showToast(e.message); }
}

async function postAnnouncement() {
  const title = $('announce-title').value.trim();
  const content = $('announce-content').value.trim();
  const priority = $('announce-priority').value;
  if (!title || !content) { showToast('Please fill in title and content'); return; }
  try {
    await api('/api/announcements', 'POST', { title, content, priority });
    showToast('📢 Announcement posted!');
    $('announce-title').value = '';
    $('announce-content').value = '';
    loadTeacherAnnouncements();
    loadAnnouncements();
  } catch (e) { showToast(e.message); }
}

async function loadTeacherAnnouncements() {
  try {
    const anns = await api('/api/announcements');
    $('teacher-announce-list').innerHTML = anns.length
      ? anns.map(a => `
        <div class="announcement-card ${a.priority}" style="margin-bottom:8px;">
          <div class="announcement-header">
            <span class="announcement-title">${sanitize(a.title)}</span>
            <span class="announcement-priority ${a.priority}">${a.priority}</span>
          </div>
          <div class="announcement-content">${sanitize(a.content)}</div>
          <button class="auth-btn secondary" style="margin-top:8px;padding:6px 14px;width:auto;" onclick="deleteAnnouncement('${a.id}')">Delete</button>
        </div>
      `).join('')
      : '<p style="color:var(--text-secondary)">No announcements yet.</p>';
  } catch {}
}

async function deleteAnnouncement(id) {
  try {
    await api(`/api/announcements/${id}`, 'DELETE');
    showToast('Deleted');
    loadTeacherAnnouncements();
    loadAnnouncements();
  } catch {}
}

// ============ SUMMARY SHEET ============
function showSummary() {
  if (!state.user) { showToast('Please sign in first'); return; }
  $('summary-modal').classList.remove('hidden');
  $('summary-avatar').textContent = state.user.avatar || '👨‍🍳';
  $('summary-name').textContent = state.user.username || '-';
  $('summary-lang').textContent = state.user.language === 'russian' ? '🇷🇺 Russian' : '🇬🇧 English';
  $('summary-role').textContent = state.user.role === 'teacher' ? '👨‍🏫 Teacher' : '🎒 Student';
  $('summary-stars').textContent = state.user.stars || 0;
  $('summary-hp').textContent = state.user.house_points || 0;
  $('summary-date').textContent = new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' });
  api('/api/scores').then(data => {
    const quizzes = data.quizzes || [];
    if (quizzes.length) {
      $('summary-quizzes').innerHTML = quizzes.slice(0, 10).map(q => `
        <div class="summary-quiz-item">
          <span>${q.subject} Y${q.year}</span>
          <span>${q.score}/${q.total}</span>
        </div>
      `).join('');
    }
    const games = data.games || [];
    if (games.length) {
      $('summary-games').innerHTML = games.slice(0, 10).map(g => `
        <div class="summary-game-item">
          <span>${g.game}</span>
          <span>${g.score} pts</span>
        </div>
      `).join('');
    }
  }).catch(() => {});
}

function closeSummary() { $('summary-modal').classList.add('hidden'); }
function printSummary() { window.print(); }

// Close modal on outside click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) closeSummary();
});

// Keyboard shortcut for summary
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 's') { e.preventDefault(); showSummary(); }
});
