// Состояние игры
const gameState = {
    character: {
        hair: 0,
        shirt: 0,
        pants: 0
    },
    player: {
        x: 50,
        y: 400,
        width: 32,
        height: 32,
        speed: 3,
        direction: 'down',
        frame: 0
    },
    mission: {
        active: false,
        timeLeft: 30,
        targetX: 1100,
        targetY: 200,
        completed: false
    },
    obstacles: [],
    otherStudents: []
};

// Цвета для кастомизации
const colors = {
    hair: ['#8B4513', '#FFD700', '#000000', '#FF6347'],
    shirt: ['#4169E1', '#DC143C', '#228B22', '#FFD700'],
    pants: ['#000080', '#000000', '#808080', '#8B4513']
};

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    initMainMenu();
    initCustomization();
    initGame();
});

// Главное меню
function initMainMenu() {
    document.getElementById('customize-btn').addEventListener('click', () => {
        showScreen('customize-screen');
        drawCharacter();
    });

    document.getElementById('start-game-btn').addEventListener('click', () => {
        showScreen('game-screen');
        startGame();
    });

    document.getElementById('support-btn').addEventListener('click', () => {
        showScreen('support-screen');
    });

    document.getElementById('back-to-menu-btn').addEventListener('click', () => {
        showScreen('main-menu');
    });

    document.getElementById('back-from-support-btn').addEventListener('click', () => {
        showScreen('main-menu');
    });
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Кастомизация персонажа
function initCustomization() {
    const optionButtons = document.querySelectorAll('.option-btn');
    
    optionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            const value = parseInt(btn.dataset.value);
            
            // Убираем выделение с других кнопок этой группы
            btn.parentElement.querySelectorAll('.option-btn').forEach(b => {
                b.classList.remove('selected');
            });
            btn.classList.add('selected');
            
            // Обновляем состояние
            gameState.character[type] = value;
            
            // Перерисовываем персонажа
            drawCharacter();
        });
    });

    // Выбираем первые опции по умолчанию
    document.querySelectorAll('.option-group').forEach((group, index) => {
        const firstBtn = group.querySelector('.option-btn');
        if (firstBtn) {
            firstBtn.classList.add('selected');
        }
    });
    
    // Отрисовываем персонажа при загрузке
    drawCharacter();
}

function drawCharacter() {
    const canvas = document.getElementById('character-canvas');
    const ctx = canvas.getContext('2d');
    
    // Настройка для пиксельной графики
    ctx.imageSmoothingEnabled = false;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const scale = 4;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Тело (штаны)
    ctx.fillStyle = colors.pants[gameState.character.pants];
    ctx.fillRect(centerX - 8 * scale, centerY + 4 * scale, 16 * scale, 12 * scale);
    
    // Футболка/кофта
    ctx.fillStyle = colors.shirt[gameState.character.shirt];
    ctx.fillRect(centerX - 8 * scale, centerY - 8 * scale, 16 * scale, 12 * scale);
    
    // Голова
    ctx.fillStyle = '#FFDBAC';
    ctx.fillRect(centerX - 6 * scale, centerY - 20 * scale, 12 * scale, 12 * scale);
    
    // Волосы
    ctx.fillStyle = colors.hair[gameState.character.hair];
    const hairStyle = gameState.character.hair;
    
    if (hairStyle === 0) { // Короткие
        ctx.fillRect(centerX - 6 * scale, centerY - 20 * scale, 12 * scale, 4 * scale);
    } else if (hairStyle === 1) { // Длинные
        ctx.fillRect(centerX - 6 * scale, centerY - 20 * scale, 12 * scale, 4 * scale);
        ctx.fillRect(centerX - 7 * scale, centerY - 16 * scale, 14 * scale, 8 * scale);
    } else if (hairStyle === 2) { // Кудрявые
        ctx.fillRect(centerX - 7 * scale, centerY - 20 * scale, 14 * scale, 6 * scale);
        // Кудри
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(centerX - 4 * scale + i * 4 * scale, centerY - 18 * scale, 2 * scale, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (hairStyle === 3) { // Ирокез
        ctx.fillRect(centerX - 2 * scale, centerY - 24 * scale, 4 * scale, 8 * scale);
    }
    
    // Глаза
    ctx.fillStyle = '#000000';
    ctx.fillRect(centerX - 4 * scale, centerY - 16 * scale, 2 * scale, 2 * scale);
    ctx.fillRect(centerX + 2 * scale, centerY - 16 * scale, 2 * scale, 2 * scale);
    
    // Рот
    ctx.fillRect(centerX - 2 * scale, centerY - 12 * scale, 4 * scale, 1 * scale);
}

// Игровая сцена
let gameCanvas, gameCtx;
let keys = {};
let gameLoop;
let missionTimer;

function initGame() {
    gameCanvas = document.getElementById('game-canvas');
    gameCtx = gameCanvas.getContext('2d');
    
    // Устанавливаем размер canvas
    gameCanvas.width = 1200;
    gameCanvas.height = 600;
    
    // Настройка для пиксельной графики
    gameCtx.imageSmoothingEnabled = false;
    
    // Обработка клавиатуры
    document.addEventListener('keydown', (e) => {
        keys[e.key.toLowerCase()] = true;
        keys[e.code] = true;
    });
    
    document.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
        keys[e.code] = false;
    });
    
    // Кнопка продолжения
    document.getElementById('continue-btn').addEventListener('click', () => {
        document.getElementById('mission-result').classList.add('hidden');
    });
}

function startGame() {
    // Сброс позиции игрока
    gameState.player.x = 50;
    gameState.player.y = 400;
    gameState.player.direction = 'down';
    gameState.player.frame = 0;
    
    // Инициализация миссии
    gameState.mission.active = true;
    gameState.mission.timeLeft = 30;
    gameState.mission.completed = false;
    
    // Создание препятствий (другие ученики)
    gameState.otherStudents = [
        { x: 300, y: 350, width: 32, height: 32, moving: true, direction: 'right', speed: 1 },
        { x: 500, y: 250, width: 32, height: 32, moving: true, direction: 'down', speed: 1 },
        { x: 700, y: 400, width: 32, height: 32, moving: true, direction: 'left', speed: 1 },
        { x: 900, y: 300, width: 32, height: 32, moving: true, direction: 'up', speed: 1 }
    ];
    
    // Таймер миссии
    updateTimer();
    missionTimer = setInterval(() => {
        if (gameState.mission.active && !gameState.mission.completed) {
            gameState.mission.timeLeft--;
            updateTimer();
            
            if (gameState.mission.timeLeft <= 0) {
                endMission(false);
            }
        }
    }, 1000);
    
    // Запуск игрового цикла
    if (gameLoop) {
        cancelAnimationFrame(gameLoop);
    }
    gameLoop = requestAnimationFrame(updateGame);
}

function updateGame() {
    if (!gameState.mission.active) {
        return;
    }
    
    // Обработка движения игрока
    handlePlayerMovement();
    
    // Обновление других учеников
    updateOtherStudents();
    
    // Проверка столкновений
    checkCollisions();
    
    // Проверка достижения цели
    checkMissionComplete();
    
    // Отрисовка
    drawGame();
    
    gameLoop = requestAnimationFrame(updateGame);
}

function handlePlayerMovement() {
    let moved = false;
    const speed = gameState.player.speed;
    
    if (keys['w'] || keys['arrowup'] || keys['KeyW']) {
        gameState.player.y = Math.max(0, gameState.player.y - speed);
        gameState.player.direction = 'up';
        moved = true;
    }
    if (keys['s'] || keys['arrowdown'] || keys['KeyS']) {
        gameState.player.y = Math.min(gameCanvas.height - gameState.player.height, gameState.player.y + speed);
        gameState.player.direction = 'down';
        moved = true;
    }
    if (keys['a'] || keys['arrowleft'] || keys['KeyA']) {
        gameState.player.x = Math.max(0, gameState.player.x - speed);
        gameState.player.direction = 'left';
        moved = true;
    }
    if (keys['d'] || keys['arrowright'] || keys['KeyD']) {
        gameState.player.x = Math.min(gameCanvas.width - gameState.player.width, gameState.player.x + speed);
        gameState.player.direction = 'right';
        moved = true;
    }
    
    // Анимация кадра
    if (moved) {
        gameState.player.frame = (gameState.player.frame + 1) % 20;
    }
}

function updateOtherStudents() {
    gameState.otherStudents.forEach(student => {
        if (student.moving) {
            switch (student.direction) {
                case 'up':
                    student.y -= student.speed;
                    if (student.y < 0) {
                        student.direction = 'down';
                    }
                    break;
                case 'down':
                    student.y += student.speed;
                    if (student.y > gameCanvas.height - student.height) {
                        student.direction = 'up';
                    }
                    break;
                case 'left':
                    student.x -= student.speed;
                    if (student.x < 0) {
                        student.direction = 'right';
                    }
                    break;
                case 'right':
                    student.x += student.speed;
                    if (student.x > gameCanvas.width - student.width) {
                        student.direction = 'left';
                    }
                    break;
            }
        }
    });
}

function checkCollisions() {
    const player = gameState.player;
    
    gameState.otherStudents.forEach(student => {
        if (player.x < student.x + student.width &&
            player.x + player.width > student.x &&
            player.y < student.y + student.height &&
            player.y + player.height > student.y) {
            // Столкновение - отталкиваем игрока
            const dx = player.x - student.x;
            const dy = player.y - student.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                player.x += (dx / distance) * 2;
                player.y += (dy / distance) * 2;
            }
            
            // Ограничиваем позицию
            player.x = Math.max(0, Math.min(gameCanvas.width - player.width, player.x));
            player.y = Math.max(0, Math.min(gameCanvas.height - player.height, player.y));
        }
    });
}

function checkMissionComplete() {
    const player = gameState.player;
    const target = gameState.mission;
    
    const distance = Math.sqrt(
        Math.pow(player.x + player.width / 2 - target.targetX, 2) +
        Math.pow(player.y + player.height / 2 - target.targetY, 2)
    );
    
    if (distance < 50 && !target.completed) {
        endMission(true);
    }
}

function endMission(success) {
    gameState.mission.active = false;
    gameState.mission.completed = true;
    
    if (missionTimer) {
        clearInterval(missionTimer);
    }
    
    const resultPopup = document.getElementById('mission-result');
    const resultTitle = document.getElementById('result-title');
    const resultMessage = document.getElementById('result-message');
    
    if (success) {
        resultTitle.textContent = '✅ Успех!';
        resultTitle.style.color = '#4a90e2';
        resultMessage.textContent = `Поздравляем! Ты успел вовремя на урок! Время: ${30 - gameState.mission.timeLeft} секунд.`;
    } else {
        resultTitle.textContent = '❌ Опоздание';
        resultTitle.style.color = '#dc143c';
        resultMessage.textContent = 'К сожалению, ты опоздал на урок. Попробуй ещё раз!';
    }
    
    resultPopup.classList.remove('hidden');
}

function updateTimer() {
    const timerElement = document.getElementById('time-left');
    timerElement.textContent = gameState.mission.timeLeft;
    
    if (gameState.mission.timeLeft <= 10) {
        timerElement.style.color = '#dc143c';
    } else {
        timerElement.style.color = '#ffd700';
    }
}

function drawGame() {
    // Очистка canvas
    gameCtx.fillStyle = '#2a3a4e';
    gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    
    // Рисуем пол (плитка)
    gameCtx.fillStyle = '#3a4a5e';
    for (let x = 0; x < gameCanvas.width; x += 40) {
        for (let y = 0; y < gameCanvas.height; y += 40) {
            if ((x / 40 + y / 40) % 2 === 0) {
                gameCtx.fillRect(x, y, 40, 40);
            }
        }
    }
    
    // Рисуем стены
    gameCtx.fillStyle = '#4a5a6e';
    gameCtx.fillRect(0, 0, gameCanvas.width, 20);
    gameCtx.fillRect(0, 0, 20, gameCanvas.height);
    gameCtx.fillRect(gameCanvas.width - 20, 0, 20, gameCanvas.height);
    gameCtx.fillRect(0, gameCanvas.height - 20, gameCanvas.width, 20);
    
    // Рисуем школу (цель)
    drawSchool(gameState.mission.targetX, gameState.mission.targetY);
    
    // Рисуем других учеников
    gameState.otherStudents.forEach(student => {
        drawStudent(student.x, student.y, '#888888');
    });
    
    // Рисуем игрока
    drawPlayer(gameState.player.x, gameState.player.y);
    
    // Рисуем индикатор цели
    drawTargetIndicator();
}

function drawSchool(x, y) {
    // Основание школы
    gameCtx.fillStyle = '#8B7355';
    gameCtx.fillRect(x - 40, y, 80, 60);
    
    // Крыша
    gameCtx.fillStyle = '#654321';
    gameCtx.beginPath();
    gameCtx.moveTo(x - 50, y);
    gameCtx.lineTo(x, y - 30);
    gameCtx.lineTo(x + 50, y);
    gameCtx.closePath();
    gameCtx.fill();
    
    // Дверь
    gameCtx.fillStyle = '#4a2c1a';
    gameCtx.fillRect(x - 10, y + 20, 20, 40);
    
    // Окна
    gameCtx.fillStyle = '#87CEEB';
    gameCtx.fillRect(x - 30, y + 10, 15, 15);
    gameCtx.fillRect(x + 15, y + 10, 15, 15);
    
    // Надпись "КЛАСС"
    gameCtx.fillStyle = '#FFFFFF';
    gameCtx.font = 'bold 16px Courier New';
    gameCtx.textAlign = 'center';
    gameCtx.fillText('КЛАСС', x, y + 80);
}

function drawPlayer(x, y) {
    const scale = 2;
    const centerX = x + gameState.player.width / 2;
    const centerY = y + gameState.player.height / 2;
    
    // Тело (штаны)
    gameCtx.fillStyle = colors.pants[gameState.character.pants];
    gameCtx.fillRect(centerX - 8 * scale, centerY + 4 * scale, 16 * scale, 12 * scale);
    
    // Футболка/кофта
    gameCtx.fillStyle = colors.shirt[gameState.character.shirt];
    gameCtx.fillRect(centerX - 8 * scale, centerY - 8 * scale, 16 * scale, 12 * scale);
    
    // Голова
    gameCtx.fillStyle = '#FFDBAC';
    gameCtx.fillRect(centerX - 6 * scale, centerY - 20 * scale, 12 * scale, 12 * scale);
    
    // Волосы
    gameCtx.fillStyle = colors.hair[gameState.character.hair];
    const hairStyle = gameState.character.hair;
    
    if (hairStyle === 0) {
        gameCtx.fillRect(centerX - 6 * scale, centerY - 20 * scale, 12 * scale, 4 * scale);
    } else if (hairStyle === 1) {
        gameCtx.fillRect(centerX - 6 * scale, centerY - 20 * scale, 12 * scale, 4 * scale);
        gameCtx.fillRect(centerX - 7 * scale, centerY - 16 * scale, 14 * scale, 8 * scale);
    } else if (hairStyle === 2) {
        gameCtx.fillRect(centerX - 7 * scale, centerY - 20 * scale, 14 * scale, 6 * scale);
        for (let i = 0; i < 3; i++) {
            gameCtx.beginPath();
            gameCtx.arc(centerX - 4 * scale + i * 4 * scale, centerY - 18 * scale, 2 * scale, 0, Math.PI * 2);
            gameCtx.fill();
        }
    } else if (hairStyle === 3) {
        gameCtx.fillRect(centerX - 2 * scale, centerY - 24 * scale, 4 * scale, 8 * scale);
    }
    
    // Глаза
    gameCtx.fillStyle = '#000000';
    gameCtx.fillRect(centerX - 4 * scale, centerY - 16 * scale, 2 * scale, 2 * scale);
    gameCtx.fillRect(centerX + 2 * scale, centerY - 16 * scale, 2 * scale, 2 * scale);
    
    // Рот
    gameCtx.fillRect(centerX - 2 * scale, centerY - 12 * scale, 4 * scale, 1 * scale);
}

function drawStudent(x, y, color) {
    const scale = 2;
    const centerX = x + 16;
    const centerY = y + 16;
    
    // Штаны
    gameCtx.fillStyle = '#555555';
    gameCtx.fillRect(centerX - 8 * scale, centerY + 4 * scale, 16 * scale, 12 * scale);
    
    // Футболка
    gameCtx.fillStyle = color;
    gameCtx.fillRect(centerX - 8 * scale, centerY - 8 * scale, 16 * scale, 12 * scale);
    
    // Голова
    gameCtx.fillStyle = '#FFDBAC';
    gameCtx.fillRect(centerX - 6 * scale, centerY - 20 * scale, 12 * scale, 12 * scale);
    
    // Волосы
    gameCtx.fillStyle = '#654321';
    gameCtx.fillRect(centerX - 6 * scale, centerY - 20 * scale, 12 * scale, 4 * scale);
    
    // Глаза
    gameCtx.fillStyle = '#000000';
    gameCtx.fillRect(centerX - 4 * scale, centerY - 16 * scale, 2 * scale, 2 * scale);
    gameCtx.fillRect(centerX + 2 * scale, centerY - 16 * scale, 2 * scale, 2 * scale);
}

function drawTargetIndicator() {
    const player = gameState.player;
    const target = gameState.mission;
    
    const dx = target.targetX - (player.x + player.width / 2);
    const dy = target.targetY - (player.y + player.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 100) {
        // Рисуем стрелку направления
        const angle = Math.atan2(dy, dx);
        const arrowX = player.x + player.width / 2 + Math.cos(angle) * 40;
        const arrowY = player.y + player.height / 2 + Math.sin(angle) * 40;
        
        gameCtx.strokeStyle = '#4a90e2';
        gameCtx.lineWidth = 3;
        gameCtx.beginPath();
        gameCtx.moveTo(arrowX, arrowY);
        gameCtx.lineTo(
            arrowX - Math.cos(angle) * 15 - Math.sin(angle) * 10,
            arrowY - Math.sin(angle) * 15 + Math.cos(angle) * 10
        );
        gameCtx.moveTo(arrowX, arrowY);
        gameCtx.lineTo(
            arrowX - Math.cos(angle) * 15 + Math.sin(angle) * 10,
            arrowY - Math.sin(angle) * 15 - Math.cos(angle) * 10
        );
        gameCtx.stroke();
    } else {
        // Рисуем круг вокруг цели
        gameCtx.strokeStyle = '#4a90e2';
        gameCtx.lineWidth = 3;
        gameCtx.setLineDash([5, 5]);
        gameCtx.beginPath();
        gameCtx.arc(target.targetX, target.targetY, 50, 0, Math.PI * 2);
        gameCtx.stroke();
        gameCtx.setLineDash([]);
    }
}
