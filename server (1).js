<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KidLearn - Fun Learning Platform</title>
  <link rel="stylesheet" href="css/style.css">
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet">
</head>
<body>
  <div id="app">
    <div id="splash-screen" class="splash-screen">
      <div class="splash-content">
        <div class="splash-logo">🎮</div>
        <h1 class="splash-title">KidLearn</h1>
        <p class="splash-subtitle">Where Learning Becomes an Adventure!</p>
        <div class="splash-loader"><div class="loader-bar"></div></div>
      </div>
    </div>

    <div id="auth-screen" class="auth-screen hidden">
      <div class="auth-container">
        <div class="auth-tabs">
          <button class="auth-tab active" data-tab="login">Sign In</button>
          <button class="auth-tab" data-tab="signup">Sign Up</button>
        </div>
        <div id="login-form" class="auth-form active">
          <div class="auth-logo">🎮</div>
          <h2>Welcome Back!</h2>
          <p class="auth-desc">Continue your learning adventure</p>
          <div class="input-group">
            <input type="text" id="login-username" placeholder="Username" class="auth-input">
            <span class="input-icon">👤</span>
          </div>
          <div class="input-group">
            <input type="password" id="login-password" placeholder="Password" class="auth-input">
            <span class="input-icon">🔒</span>
          </div>
          <button id="login-btn" class="auth-btn">Let's Go! 🚀</button>
          <p id="login-error" class="auth-error"></p>
        </div>
        <div id="signup-form" class="auth-form">
          <div class="auth-logo">🎮</div>
          <h2>Join the Adventure!</h2>
          <p class="auth-desc">Create your KidLearn account</p>
          <div class="input-group">
            <input type="text" id="signup-username" placeholder="Choose a username" class="auth-input">
            <span class="input-icon">👤</span>
          </div>
          <div class="input-group">
            <input type="password" id="signup-password" placeholder="Create a password" class="auth-input">
            <span class="input-icon">🔒</span>
          </div>
          <div class="input-group">
            <select id="signup-language" class="auth-input">
              <option value="english">🇬🇧 English</option>
              <option value="russian">🇷🇺 Русский</option>
            </select>
            <span class="input-icon">🌐</span>
          </div>
          <div class="input-group">
            <select id="signup-role" class="auth-input">
              <option value="student">🎒 Student</option>
              <option value="teacher">👨‍🏫 Teacher</option>
            </select>
            <span class="input-icon">📚</span>
          </div>
          <div class="signup-avatar-picker">
            <p>Choose Your Avatar:</p>
            <div class="avatar-options" id="signup-avatars">
              <span class="avatar-option selected" data-avatar="👨‍🍳">👨‍🍳</span>
              <span class="avatar-option" data-avatar="👩‍🍳">👩‍🍳</span>
              <span class="avatar-option" data-avatar="🧑‍🚀">🧑‍🚀</span>
              <span class="avatar-option" data-avatar="🦸‍♂️">🦸‍♂️</span>
              <span class="avatar-option" data-avatar="🧙‍♂️">🧙‍♂️</span>
              <span class="avatar-option" data-avatar="🐱">🐱</span>
              <span class="avatar-option" data-avatar="🐶">🐶</span>
              <span class="avatar-option" data-avatar="🦊">🦊</span>
              <span class="avatar-option" data-avatar="🐼">🐼</span>
              <span class="avatar-option" data-avatar="🐸">🐸</span>
              <span class="avatar-option" data-avatar="🤖">🤖</span>
              <span class="avatar-option" data-avatar="👾">👾</span>
            </div>
          </div>
          <div class="signup-bg-picker">
            <p>Choose Your Theme:</p>
            <div class="bg-options">
              <div class="bg-option selected" data-bg="ocean" style="background: linear-gradient(135deg, #00b4d8, #0077b6);">🌊 Ocean</div>
              <div class="bg-option" data-bg="forest" style="background: linear-gradient(135deg, #2d6a4f, #52b788);">🌲 Forest</div>
              <div class="bg-option" data-bg="space" style="background: linear-gradient(135deg, #240046, #7b2cbf);">🚀 Space</div>
              <div class="bg-option" data-bg="sunset" style="background: linear-gradient(135deg, #f77f00, #fcbf49);">🌅 Sunset</div>
              <div class="bg-option" data-bg="candy" style="background: linear-gradient(135deg, #ff006e, #fb5607);">🍬 Candy</div>
              <div class="bg-option" data-bg="galaxy" style="background: linear-gradient(135deg, #0f0c29, #302b63);">🌌 Galaxy</div>
            </div>
          </div>
          <button id="signup-btn" class="auth-btn">Start Adventure! 🎉</button>
          <p id="signup-error" class="auth-error"></p>
        </div>
      </div>
    </div>

    <div id="dashboard-screen" class="dashboard-screen hidden">
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-header">
          <div class="sidebar-logo">🎮 <span>KidLearn</span></div>
        </div>
        <div class="sidebar-user" id="sidebar-user">
          <div class="user-avatar-large" id="sidebar-avatar">👨‍🍳</div>
          <div class="user-info">
            <span class="user-name" id="sidebar-name">Student</span>
            <span class="user-role" id="sidebar-role">🎒 Student</span>
          </div>
        </div>
        <div class="sidebar-points">
          <div class="point-badge stars-badge">⭐ <span id="sidebar-stars">0</span></div>
          <div class="point-badge hp-badge">🏆 <span id="sidebar-hp">0</span></div>
        </div>
        <nav class="sidebar-nav" id="sidebar-nav">
          <button class="nav-item active" data-page="home"><span class="nav-icon">🏠</span> Home</button>
          <button class="nav-item" data-page="subjects"><span class="nav-icon">📚</span> Subjects</button>
          <button class="nav-item" data-page="quizzes"><span class="nav-icon">📝</span> Quizzes</button>
          <button class="nav-item" data-page="games"><span class="nav-icon">🎮</span> Games</button>
          <button class="nav-item" data-page="world"><span class="nav-icon">🌍</span> World Islands</button>
          <button class="nav-item" data-page="leaderboard"><span class="nav-icon">🏆</span> Leaderboard</button>
          <button class="nav-item" data-page="settings"><span class="nav-icon">⚙️</span> Settings</button>
        </nav>
        <nav class="sidebar-nav teacher-nav hidden" id="teacher-nav">
          <div class="nav-section-title">👨‍🏫 Teacher</div>
          <button class="nav-item" data-page="teacher-dashboard"><span class="nav-icon">📊</span> Dashboard</button>
          <button class="nav-item" data-page="teacher-students"><span class="nav-icon">👥</span> Students</button>
          <button class="nav-item" data-page="teacher-announce"><span class="nav-icon">📢</span> Announce</button>
        </nav>
        <div class="sidebar-footer">
          <button onclick="showSummary()" class="nav-item"><span class="nav-icon">📋</span> Summary Sheet</button>
          <button id="logout-btn" class="nav-item"><span class="nav-icon">🚪</span> Sign Out</button>
        </div>
      </aside>

      <main class="main-content" id="main-content">
        <header class="topbar" id="topbar">
          <button class="hamburger" id="hamburger">☰</button>
          <div class="topbar-title" id="topbar-title">🏠 Home</div>
          <div class="topbar-right">
            <div class="topbar-points">
              <span class="point-badge stars-badge">⭐ <span id="topbar-stars">0</span></span>
              <span class="point-badge hp-badge">🏆 <span id="topbar-hp">0</span></span>
            </div>
            <div class="topbar-avatar" id="topbar-avatar">👨‍🍳</div>
          </div>
        </header>

        <div class="page-container" id="page-container">

          <!-- Home Page -->
          <div class="page active" id="page-home">
            <div class="welcome-banner" id="welcome-banner">
              <div class="welcome-text">
                <h1>Welcome back, <span id="welcome-name">Student</span>! 👋</h1>
                <p id="welcome-quote">"Learning is an adventure that never ends!"</p>
              </div>
              <div class="welcome-stats">
                <div class="stat-card"><span class="stat-number" id="home-stars">0</span><span class="stat-label">⭐ Stars</span></div>
                <div class="stat-card"><span class="stat-number" id="home-hp">0</span><span class="stat-label">🏆 House Points</span></div>
                <div class="stat-card"><span class="stat-number" id="home-quizzes">0</span><span class="stat-label">📝 Quizzes Done</span></div>
              </div>
            </div>
            <div class="announcements-section" id="announcements-section">
              <h2>📢 Announcements</h2>
              <div class="announcements-list" id="announcements-list"></div>
            </div>
            <div class="quick-actions">
              <h2>⚡ Quick Actions</h2>
              <div class="actions-grid">
                <div class="action-card" onclick="navigateTo('quizzes')">📝 <span>Take a Quiz</span></div>
                <div class="action-card" onclick="navigateTo('games')">🎮 <span>Play Games</span></div>
                <div class="action-card" onclick="navigateTo('world')">🌍 <span>Explore Islands</span></div>
                <div class="action-card" onclick="navigateTo('subjects')">📚 <span>Learn</span></div>
              </div>
            </div>
          </div>

          <!-- Subjects Page -->
          <div class="page" id="page-subjects">
            <h1>📚 Subjects</h1>
            <div class="subjects-grid">
              <div class="subject-card math" onclick="startSubject('math')">
                <div class="subject-icon">🔢</div>
                <h2>Mathematics</h2>
                <p>Numbers, shapes, and fun calculations!</p>
                <div class="subject-years">
                  <span class="year-badge" onclick="event.stopPropagation();startQuiz('math',1)">Year 1</span>
                  <span class="year-badge" onclick="event.stopPropagation();startQuiz('math',2)">Year 2</span>
                </div>
              </div>
              <div class="subject-card russian" onclick="startSubject('russian')">
                <div class="subject-icon">🇷🇺</div>
                <h2>Russian</h2>
                <p>Изучай русский язык весело!</p>
                <div class="subject-years">
                  <span class="year-badge" onclick="event.stopPropagation();startQuiz('russian',1)">Year 1</span>
                  <span class="year-badge" onclick="event.stopPropagation();startQuiz('russian',2)">Year 2</span>
                </div>
              </div>
              <div class="subject-card english" onclick="startSubject('english')">
                <div class="subject-icon">🇬🇧</div>
                <h2>English</h2>
                <p>Learn English words and sentences!</p>
                <div class="subject-years">
                  <span class="year-badge" onclick="event.stopPropagation();startQuiz('english',1)">Year 1</span>
                  <span class="year-badge" onclick="event.stopPropagation();startQuiz('english',2)">Year 2</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Quizzes Page -->
          <div class="page" id="page-quizzes">
            <div id="quiz-select">
              <h1>📝 Quizzes</h1>
              <p class="page-subtitle">Select a subject and year to start!</p>
              <div class="quiz-grid" id="quiz-grid"></div>
            </div>
            <div id="quiz-active" class="hidden">
              <div class="quiz-header">
                <h2 id="quiz-title">Quiz</h2>
                <div class="quiz-progress"><span id="quiz-current">1</span>/<span id="quiz-total">10</span></div>
              </div>
              <div class="quiz-progress-bar"><div class="quiz-progress-fill" id="quiz-progress-fill"></div></div>
              <div class="quiz-question" id="quiz-question"></div>
              <div class="quiz-options" id="quiz-options"></div>
              <div class="quiz-controls">
                <button class="quiz-btn secondary" id="quiz-prev" disabled>← Previous</button>
                <span id="quiz-score-display">⭐ 0</span>
                <button class="quiz-btn primary" id="quiz-next">Next →</button>
              </div>
            </div>
            <div id="quiz-result" class="hidden">
              <div class="result-card">
                <div class="result-icon" id="result-icon">🎉</div>
                <h2 id="result-title">Great Job!</h2>
                <p id="result-score">You scored 10/10</p>
                <div class="result-stars" id="result-stars-msg">⭐ +10 stars earned!</div>
                <button class="auth-btn" onclick="showQuizResults()">View Details</button>
                <button class="auth-btn secondary" onclick="backToQuizzes()">Back to Quizzes</button>
              </div>
            </div>
          </div>

          <!-- Games Page -->
          <div class="page" id="page-games">
            <h1>🎮 Games</h1>
            <p class="page-subtitle">Learn while playing fun games!</p>
            <div class="games-grid" id="games-grid">
              <div class="game-card" onclick="startGame('memory')">
                <div class="game-icon">🧠</div>
                <h3>Memory Match</h3>
                <p>Match the pairs!</p>
                <span class="game-badge">🎯 Fun</span>
              </div>
              <div class="game-card" onclick="startGame('mathrush')">
                <div class="game-icon">🔢</div>
                <h3>Math Rush</h3>
                <p>Solve fast!</p>
                <span class="game-badge">⚡ Speed</span>
              </div>
              <div class="game-card" onclick="startGame('worddrop')">
                <div class="game-icon">📝</div>
                <h3>Word Drop</h3>
                <p>Catch the letters!</p>
                <span class="game-badge">📖 Spelling</span>
              </div>
              <div class="game-card" onclick="startGame('colormatch')">
                <div class="game-icon">🎨</div>
                <h3>Color Match</h3>
                <p>Match the colors!</p>
                <span class="game-badge">👁️ Focus</span>
              </div>
            </div>
            <div id="game-active" class="hidden">
              <div class="game-header">
                <h2 id="game-title">Game</h2>
                <span id="game-score">Score: 0</span>
              </div>
              <div id="game-area" class="game-area"></div>
              <button class="auth-btn secondary" onclick="exitGame()">Exit Game</button>
            </div>
          </div>

          <!-- World Islands Page -->
          <div class="page" id="page-world">
            <div id="world-select">
              <h1>🌍 World Islands</h1>
              <p class="page-subtitle">Explore islands, play with friends in real-time!</p>
              <div class="islands-grid" id="islands-grid">
                <div class="island-card" onclick="joinIsland('playground')">
                  <div class="island-icon">🎪</div>
                  <h3>Playground Island</h3>
                  <p>Chat, play, and make friends!</p>
                  <span class="island-online" id="online-playground">🟢 0 online</span>
                </div>
                <div class="island-card" onclick="joinIsland('adventure')">
                  <div class="island-icon">🏝️</div>
                  <h3>Adventure Island</h3>
                  <p>Explore and discover treasures!</p>
                  <span class="island-online" id="online-adventure">🟢 0 online</span>
                </div>
                <div class="island-card" onclick="joinIsland('dojo')">
                  <div class="island-icon">🥋</div>
                  <h3>Dojo Island</h3>
                  <p>Train, compete, earn belts!</p>
                  <span class="island-online" id="online-dojo">🟢 0 online</span>
                </div>
                <div class="island-card" onclick="joinIsland('space')">
                  <div class="island-icon">🚀</div>
                  <h3>Space Station</h3>
                  <p>Among Us style missions!</p>
                  <span class="island-online" id="online-space">🟢 0 online</span>
                </div>
                <div class="island-card" onclick="joinIsland('minecraft')">
                  <div class="island-icon">⛏️</div>
                  <h3>Block World</h3>
                  <p>Build and create together!</p>
                  <span class="island-online" id="online-minecraft">🟢 0 online</span>
                </div>
                <div class="island-card" onclick="joinIsland('party')">
                  <div class="island-icon">🎉</div>
                  <h3>Party Island</h3>
                  <p>Events, games, and fun!</p>
                  <span class="island-online" id="online-party">🟢 0 online</span>
                </div>
              </div>
            </div>
            <div id="world-active" class="hidden">
              <div class="world-header">
                <button class="auth-btn secondary" onclick="leaveIsland()">← Leave Island</button>
                <h2 id="world-island-name">Playground Island</h2>
                <span id="world-online-count">0 online</span>
              </div>
              <div class="world-container">
                <div class="world-canvas-container">
                  <canvas id="world-canvas" width="800" height="500"></canvas>
                </div>
                <div class="world-chat">
                  <div class="world-chat-header">💬 Island Chat</div>
                  <div class="world-chat-messages" id="world-chat-msgs"></div>
                  <div class="world-chat-input">
                    <input type="text" id="world-chat-input" placeholder="Say something..." maxlength="100">
                    <button id="world-chat-send">Send</button>
                  </div>
                </div>
              </div>
              <div class="world-actions">
                <button class="world-action-btn" onclick="sendHighfive()">✋ High Five</button>
                <button class="world-action-btn" onclick="sendExplosion()">💥 Explosion!</button>
                <button class="world-action-btn" onclick="worldDance()">💃 Dance!</button>
              </div>
            </div>
          </div>

          <!-- Leaderboard Page -->
          <div class="page" id="page-leaderboard">
            <h1>🏆 Leaderboard</h1>
            <p class="page-subtitle">Top students by House Points</p>
            <div class="leaderboard-controls">
              <button class="auth-btn active sort-btn" data-sort="hp" onclick="sortLeaderboard('hp')">🏆 House Points</button>
              <button class="auth-btn sort-btn" data-sort="stars" onclick="sortLeaderboard('stars')">⭐ Stars</button>
            </div>
            <div class="leaderboard-list" id="leaderboard-list"></div>
          </div>

          <!-- Settings Page -->
          <div class="page" id="page-settings">
            <h1>⚙️ Settings</h1>
            <div class="settings-grid">
              <div class="settings-card">
                <h2>👤 Profile</h2>
                <div class="input-group">
                  <label>Username</label>
                  <input type="text" id="settings-username" class="auth-input">
                </div>
                <div class="input-group">
                  <label>Language</label>
                  <select id="settings-language" class="auth-input">
                    <option value="english">🇬🇧 English</option>
                    <option value="russian">🇷🇺 Русский</option>
                  </select>
                </div>
                <button class="auth-btn" onclick="saveProfile()">Save Profile 💾</button>
              </div>
              <div class="settings-card">
                <h2>🎨 Avatar Studio</h2>
                <p>Mix and match your look!</p>
                <div class="avatar-studio" id="avatar-studio">
                  <div class="avatar-preview" id="avatar-preview">👨‍🍳</div>
                  <div class="avatar-categories">
                    <button class="avatar-cat active" data-cat="faces">Faces</button>
                    <button class="avatar-cat" data-cat="outfits">Outfits</button>
                    <button class="avatar-cat" data-cat="accessories">Accessories</button>
                    <button class="avatar-cat" data-cat="animals">Animals</button>
                    <button class="avatar-cat" data-cat="food">Food</button>
                  </div>
                  <div class="avatar-options-grid" id="avatar-options-grid"></div>
                </div>
                <button class="auth-btn" onclick="saveAvatar()">Save Avatar 💾</button>
              </div>
              <div class="settings-card">
                <h2>🖼️ Theme</h2>
                <p>Choose your background</p>
                <div class="bg-options-settings" id="bg-options-settings"></div>
                <button class="auth-btn" onclick="saveBackground()">Save Theme 💾</button>
              </div>
            </div>
          </div>

          <!-- Teacher Dashboard -->
          <div class="page" id="page-teacher-dashboard">
            <h1>📊 Teacher Dashboard</h1>
            <div class="teacher-stats">
              <div class="stat-card"><span class="stat-number" id="teacher-total-students">0</span><span class="stat-label">👥 Students</span></div>
              <div class="stat-card"><span class="stat-number" id="teacher-total-quizzes">0</span><span class="stat-label">📝 Quizzes Taken</span></div>
              <div class="stat-card"><span class="stat-number" id="teacher-total-stars">0</span><span class="stat-label">⭐ Total Stars</span></div>
              <div class="stat-card"><span class="stat-number" id="teacher-total-hp">0</span><span class="stat-label">🏆 Total HP</span></div>
            </div>
            <div class="teacher-recent" id="teacher-recent"></div>
          </div>

          <!-- Teacher Students -->
          <div class="page" id="page-teacher-students">
            <h1>👥 Manage Students</h1>
            <div class="teacher-search">
              <input type="text" id="teacher-search" placeholder="Search students..." class="auth-input">
            </div>
            <div class="teacher-table-container">
              <table class="teacher-table" id="teacher-students-table">
                <thead>
                  <tr><th>Avatar</th><th>Username</th><th>Language</th><th>⭐ Stars</th><th>🏆 HP</th><th>Actions</th></tr>
                </thead>
                <tbody id="teacher-students-body"></tbody>
              </table>
            </div>
          </div>

          <!-- Teacher Announce -->
          <div class="page" id="page-teacher-announce">
            <h1>📢 Make Announcement</h1>
            <div class="settings-card">
              <div class="input-group">
                <label>Title</label>
                <input type="text" id="announce-title" class="auth-input" placeholder="Announcement title...">
              </div>
              <div class="input-group">
                <label>Message</label>
                <textarea id="announce-content" class="auth-input announce-textarea" placeholder="Write your announcement..." rows="5"></textarea>
              </div>
              <div class="input-group">
                <label>Priority</label>
                <select id="announce-priority" class="auth-input">
                  <option value="normal">📌 Normal</option>
                  <option value="important">🔴 Important</option>
                  <option value="urgent">🚨 Urgent</option>
                  <option value="fun">🎉 Fun</option>
                </select>
              </div>
              <button class="auth-btn" onclick="postAnnouncement()">📢 Post Announcement</button>
            </div>
            <h2 style="margin-top:30px;">📋 Previous Announcements</h2>
            <div class="announcements-list" id="teacher-announce-list"></div>
          </div>

        </div>
      </main>
    </div>

    <!-- Summary Sheet Modal -->
    <div id="summary-modal" class="modal hidden">
      <div class="modal-content summary-modal-content">
        <button class="modal-close" onclick="closeSummary()">✕</button>
        <div class="summary-sheet" id="summary-sheet">
          <div class="summary-header">
            <div class="summary-logo">🎮</div>
            <h1>KidLearn</h1>
            <p class="summary-subtitle">Learning Adventure Summary</p>
          </div>
          <div class="summary-body">
            <div class="summary-section">
              <h2>👤 Student Profile</h2>
              <div class="summary-profile">
                <span class="summary-avatar" id="summary-avatar">👨‍🍳</span>
                <div>
                  <p><strong>Name:</strong> <span id="summary-name">-</span></p>
                  <p><strong>Language:</strong> <span id="summary-lang">-</span></p>
                  <p><strong>Role:</strong> <span id="summary-role">-</span></p>
                </div>
              </div>
            </div>
            <div class="summary-section">
              <h2>⭐ Points & Rewards</h2>
              <div class="summary-points-grid">
                <div class="summary-point-card"><span class="summary-point-num" id="summary-stars">0</span><span>⭐ Stars</span></div>
                <div class="summary-point-card"><span class="summary-point-num" id="summary-hp">0</span><span>🏆 House Points</span></div>
              </div>
            </div>
            <div class="summary-section">
              <h2>📝 Quiz Performance</h2>
              <div id="summary-quizzes">No quizzes completed yet.</div>
            </div>
            <div class="summary-section">
              <h2>🎮 Games Played</h2>
              <div id="summary-games">No games played yet.</div>
            </div>
          </div>
          <div class="summary-footer">
            <p>Generated on <span id="summary-date">-</span></p>
            <button class="auth-btn" onclick="printSummary()">🖨️ Print / Save PDF</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast notification -->
    <div id="toast" class="toast hidden"></div>
  </div>

  <script src="https://cdn.socket.io/4.7.4/socket.io.min.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
