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
        completed: false,
        late: false
    },
    obstacles: [],
    otherStudents: [],
    confidence: 50,
    currentQuestion: 0,
    questionsAnswered: 0,
    directorDialogueStep: 0
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
    const customizeBtn = document.getElementById('customize-btn');
    const startGameBtn = document.getElementById('start-game-btn');
    const supportBtn = document.getElementById('support-btn');
    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    const backFromSupportBtn = document.getElementById('back-from-support-btn');

    if (customizeBtn) {
        customizeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showScreen('customize-screen');
            drawCharacter();
        });
    }

    if (startGameBtn) {
        startGameBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showScreen('game-screen');
            startGame();
        });
    }

    if (supportBtn) {
        supportBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showScreen('support-screen');
        });
    }

    if (backToMenuBtn) {
        backToMenuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showScreen('main-menu');
        });
    }

    if (backFromSupportBtn) {
        backFromSupportBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showScreen('main-menu');
        });
    }
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
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
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
    gameState.mission.late = false;
    
    // Начальная подсказка помощника
    updateHelperText('🏃 Доберись до класса вовремя! Используй WASD или стрелки.');
    
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
    
    // Обновляем подсказки помощника
    initHelper();
    
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
    
    if (success) {
        const resultPopup = document.getElementById('mission-result');
        const resultTitle = document.getElementById('result-title');
        const resultMessage = document.getElementById('result-message');
        
        resultTitle.textContent = '✅ Успех!';
        resultTitle.style.color = '#4a90e2';
        resultMessage.textContent = `Поздравляем! Ты успел вовремя на урок! Время: ${30 - gameState.mission.timeLeft} секунд.`;
        
        resultPopup.classList.remove('hidden');
        
        // После успеха переходим к уроку
        const continueBtn = document.getElementById('continue-btn');
        if (continueBtn) {
            continueBtn.onclick = null;
            continueBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                resultPopup.classList.add('hidden');
                startLesson();
            });
        }
    } else {
        // При опоздании показываем диалог выбора
        gameState.mission.late = true;
        showLateChoiceDialog();
    }
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
    
    // Рисуем древесный пол
    // Загружаем изображение пола
const floorImage = new Image();
floorImage.src = 'floor.png';

// Рисуем пол на игровом канвасе
function drawWoodenFloor() {
    if (!floorImage.complete) {
        floorImage.onload = () => {
            gameCtx.drawImage(floorImage, 0, 0, gameCanvas.width, gameCanvas.height);
        };
    } else {
        gameCtx.drawImage(floorImage, 0, 0, gameCanvas.width, gameCanvas.height);
    }
}

    
    // Рисуем стены
    gameCtx.fillStyle = '#4a5a6e';
    gameCtx.fillRect(0, 0, gameCanvas.width, 20);
    gameCtx.fillRect(0, 0, 20, gameCanvas.height);
    gameCtx.fillRect(gameCanvas.width - 20, 0, 20, gameCanvas.height);
    gameCtx.fillRect(0, gameCanvas.height - 20, gameCanvas.width, 20);
    
    // Рисуем дверь кабинета (цель)
    drawDoor(gameState.mission.targetX, gameState.mission.targetY);
    
    // Рисуем других учеников
    gameState.otherStudents.forEach(student => {
        drawStudent(student.x, student.y, '#888888');
    });
    
    // Рисуем игрока
    drawPlayer(gameState.player.x, gameState.player.y);
    
    // Рисуем индикатор цели
    drawTargetIndicator();
}

// Рисуем древесный пол
function drawWoodenFloor() {
    const boardWidth = 80;
    const boardHeight = 20;
    
    // Цвета дерева
    const woodColors = [
        '#8B6F47', // Светлое дерево
        '#7A5F3D', // Среднее дерево
        '#6B4F33'  // Тёмное дерево
    ];
    
    // Рисуем доски пола
    for (let y = 20; y < gameCanvas.height - 20; y += boardHeight) {
        for (let x = 20; x < gameCanvas.width - 20; x += boardWidth) {
            // Выбираем случайный оттенок дерева для каждой доски
            const colorIndex = Math.floor((x + y) / boardWidth) % woodColors.length;
            gameCtx.fillStyle = woodColors[colorIndex];
            
            // Рисуем доску
            gameCtx.fillRect(x, y, boardWidth, boardHeight);
            
            // Рисуем текстуру дерева (вертикальные линии)
            gameCtx.strokeStyle = '#5A3F27';
            gameCtx.lineWidth = 1;
            for (let i = 0; i < boardWidth; i += 8) {
                gameCtx.beginPath();
                gameCtx.moveTo(x + i, y);
                gameCtx.lineTo(x + i, y + boardHeight);
                gameCtx.stroke();
            }
            
            // Рисуем сучки/узлы
            if (Math.random() > 0.7) {
                gameCtx.fillStyle = '#4A2F1F';
                gameCtx.beginPath();
                gameCtx.arc(x + Math.random() * boardWidth, y + Math.random() * boardHeight, 2, 0, Math.PI * 2);
                gameCtx.fill();
            }
        }
    }
}

// Рисуем дверь кабинета
function drawDoor(x, y) {
    const doorWidth = 60;
    const doorHeight = 100;
    
    // Дверная коробка
    gameCtx.fillStyle = '#654321';
    gameCtx.fillRect(x - doorWidth/2 - 5, y - doorHeight, doorWidth + 10, doorHeight + 10);
    
    // Сама дверь
    gameCtx.fillStyle = '#8B6F47';
    gameCtx.fillRect(x - doorWidth/2, y - doorHeight + 5, doorWidth, doorHeight);
    
    // Текстура дерева на двери (вертикальные линии)
    gameCtx.strokeStyle = '#6B4F33';
    gameCtx.lineWidth = 2;
    for (let i = 0; i < doorWidth; i += 10) {
        gameCtx.beginPath();
        gameCtx.moveTo(x - doorWidth/2 + i, y - doorHeight + 5);
        gameCtx.lineTo(x - doorWidth/2 + i, y - 5);
        gameCtx.stroke();
    }
    
    // Дверная ручка
    gameCtx.fillStyle = '#C0C0C0';
    gameCtx.beginPath();
    gameCtx.arc(x + doorWidth/2 - 15, y - doorHeight/2, 5, 0, Math.PI * 2);
    gameCtx.fill();
    
    // Номер кабинета (табличка)
    gameCtx.fillStyle = '#2a2a3e';
    gameCtx.fillRect(x - 20, y - doorHeight - 25, 40, 20);
    gameCtx.strokeStyle = '#4a90e2';
    gameCtx.lineWidth = 2;
    gameCtx.strokeRect(x - 20, y - doorHeight - 25, 40, 20);
    
    // Номер на табличке
    gameCtx.fillStyle = '#FFFFFF';
    gameCtx.font = 'bold 14px Courier New';
    gameCtx.textAlign = 'center';
    gameCtx.fillText('101', x, y - doorHeight - 12);
    
    // Надпись "КЛАСС" под дверью
    gameCtx.fillStyle = '#FFFFFF';
    gameCtx.font = 'bold 16px Courier New';
    gameCtx.textAlign = 'center';
    gameCtx.fillText('КЛАСС', x, y + 20);
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

// Плашка помощника
function updateHelperText(text) {
    const helperText = document.getElementById('helper-text');
    helperText.textContent = text;
}

let lastHelperUpdate = 0;
function initHelper() {
    // Обновляем подсказки не каждый кадр, а раз в секунду
    const now = Date.now();
    if (now - lastHelperUpdate < 1000 && lastHelperUpdate !== 0) {
        return;
    }
    lastHelperUpdate = now;
    
    // Обновляем подсказки в зависимости от ситуации
    if (gameState.mission.active) {
        const timeLeft = gameState.mission.timeLeft;
        const player = gameState.player;
        const target = gameState.mission;
        const distance = Math.sqrt(
            Math.pow(player.x + player.width / 2 - target.targetX, 2) +
            Math.pow(player.y + player.height / 2 - target.targetY, 2)
        );
        
        if (timeLeft <= 10) {
            updateHelperText('⏰ Осталось мало времени! Спеши к классу!');
        } else if (distance < 200) {
            updateHelperText('🎯 Ты почти у цели! Иди прямо к двери!');
        } else if (distance < 400) {
            updateHelperText('📍 Класс уже близко! Продолжай движение!');
        } else {
            updateHelperText('🏃 Двигайся вправо и вверх к классу!');
        }
    }
}

// Диалог выбора после опоздания
function showLateChoiceDialog() {
    const dialog = document.getElementById('late-choice-dialog');
    if (!dialog) return;
    
    dialog.classList.remove('hidden');
    
    const apologizeBtn = document.getElementById('apologize-btn');
    const skipClassBtn = document.getElementById('skip-class-btn');
    
    if (apologizeBtn) {
        apologizeBtn.onclick = null; // Очищаем старые обработчики
        apologizeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dialog.classList.add('hidden');
            goToDirector();
        });
    }
    
    if (skipClassBtn) {
        skipClassBtn.onclick = null;
        skipClassBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dialog.classList.add('hidden');
            goToDirector();
        });
    }
}

// Переход к директору
function goToDirector() {
    showScreen('director-screen');
    gameState.directorDialogueStep = 0;
    showDirectorDialogue();
    drawPlayerInDirector();
}

function drawPlayerInDirector() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    
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
    
    if (hairStyle === 0) {
        ctx.fillRect(centerX - 6 * scale, centerY - 20 * scale, 12 * scale, 4 * scale);
    } else if (hairStyle === 1) {
        ctx.fillRect(centerX - 6 * scale, centerY - 20 * scale, 12 * scale, 4 * scale);
        ctx.fillRect(centerX - 7 * scale, centerY - 16 * scale, 14 * scale, 8 * scale);
    } else if (hairStyle === 2) {
        ctx.fillRect(centerX - 7 * scale, centerY - 20 * scale, 14 * scale, 6 * scale);
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(centerX - 4 * scale + i * 4 * scale, centerY - 18 * scale, 2 * scale, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (hairStyle === 3) {
        ctx.fillRect(centerX - 2 * scale, centerY - 24 * scale, 4 * scale, 8 * scale);
    }
    
    // Глаза
    ctx.fillStyle = '#000000';
    ctx.fillRect(centerX - 4 * scale, centerY - 16 * scale, 2 * scale, 2 * scale);
    ctx.fillRect(centerX + 2 * scale, centerY - 16 * scale, 2 * scale, 2 * scale);
    
    // Рот
    ctx.fillRect(centerX - 2 * scale, centerY - 12 * scale, 4 * scale, 1 * scale);
    
    const preview = document.querySelector('.player-sprite-preview');
    preview.innerHTML = '';
    preview.appendChild(canvas);
}

const directorDialogues = [
    { speaker: 'Директор:', text: 'Так, объясни ситуацию.' },
    { speaker: 'Ты:', text: 'Извините, я опоздал...' },
    { speaker: 'Директор:', text: 'Хм, понимаю. В следующий раз будь внимательнее.' },
    { speaker: 'Директор:', text: 'Ладно, иди на урок. Но больше так не делай!' }
];

function showDirectorDialogue() {
    const dialogueDiv = document.getElementById('director-dialogue');
    const step = gameState.directorDialogueStep;
    
    if (step < directorDialogues.length) {
        const dialogue = directorDialogues[step];
        dialogueDiv.innerHTML = `
            <p class="speaker">${dialogue.speaker}</p>
            <p class="text">${dialogue.text}</p>
        `;
        
        const nextBtn = document.getElementById('next-director-btn');
        if (nextBtn) {
            nextBtn.onclick = null;
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                gameState.directorDialogueStep++;
                if (gameState.directorDialogueStep >= directorDialogues.length) {
                    startLesson();
                } else {
                    showDirectorDialogue();
                }
            });
        }
    }
}

// Урок с вопросами
const questions = [
    {
        question: 'Когда были декабрьские события в Казахстане?',
        answers: ['1986 год', '1991 год', '1995 год', '2000 год'],
        correct: 0
    },
    {
        question: 'Какое событие произошло в декабре 1986 года в Алма-Ате?',
        answers: ['Землетрясение', 'Молодёжные протесты', 'Открытие университета', 'Визит президента'],
        correct: 1
    },
    {
        question: 'Кто был первым президентом независимого Казахстана?',
        answers: ['Нурсултан Назарбаев', 'Касым-Жомарт Токаев', 'Аскар Акаев', 'Ислам Каримов'],
        correct: 0
    },
    {
        question: 'В каком году Казахстан обрёл независимость?',
        answers: ['1989', '1990', '1991', '1992'],
        correct: 2
    },
    {
        question: 'Какая столица была у Казахстана до Астаны (Нур-Султана)?',
        answers: ['Алма-Ата', 'Караганда', 'Шымкент', 'Актобе'],
        correct: 0
    }
];

function startLesson() {
    showScreen('lesson-screen');
    gameState.currentQuestion = 0;
    gameState.questionsAnswered = 0;
    gameState.confidence = 50;
    updateConfidenceMeter();
    showQuestion();
}

function showQuestion() {
    if (gameState.currentQuestion >= questions.length) {
        endLesson();
        return;
    }
    
    const question = questions[gameState.currentQuestion];
    const questionNumber = document.getElementById('question-number');
    const questionText = document.getElementById('question-text');
    const answerOptions = document.getElementById('answer-options');
    const feedback = document.getElementById('answer-feedback');
    
    questionNumber.textContent = `Вопрос ${gameState.currentQuestion + 1} из ${questions.length}`;
    questionText.textContent = question.question;
    
    answerOptions.innerHTML = '';
    feedback.classList.add('hidden');
    
    question.answers.forEach((answer, index) => {
        const button = document.createElement('button');
        button.className = 'answer-option';
        button.textContent = answer;
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            selectAnswer(index, question.correct);
        });
        answerOptions.appendChild(button);
    });
}

function selectAnswer(selectedIndex, correctIndex) {
    const question = questions[gameState.currentQuestion];
    const answerOptions = document.querySelectorAll('.answer-option');
    const feedback = document.getElementById('answer-feedback');
    
    // Отключаем все кнопки
    answerOptions.forEach(btn => {
        btn.style.pointerEvents = 'none';
    });
    
    // Показываем правильный/неправильный ответ
    if (selectedIndex === correctIndex) {
        answerOptions[selectedIndex].classList.add('correct');
        feedback.textContent = '✅ Правильно!';
        feedback.className = 'answer-feedback correct';
        gameState.confidence = Math.min(100, gameState.confidence + 10);
        gameState.questionsAnswered++;
    } else {
        answerOptions[selectedIndex].classList.add('incorrect');
        answerOptions[correctIndex].classList.add('correct');
        feedback.textContent = '❌ Неправильно. Правильный ответ выделен зелёным.';
        feedback.className = 'answer-feedback incorrect';
        gameState.confidence = Math.max(0, gameState.confidence - 5);
    }
    
    feedback.classList.remove('hidden');
    updateConfidenceMeter();
    
    // Переход к следующему вопросу через 2 секунды
    setTimeout(() => {
        gameState.currentQuestion++;
        showQuestion();
    }, 2000);
}

function updateConfidenceMeter() {
    const fill = document.getElementById('confidence-fill');
    const value = document.getElementById('confidence-value');
    
    fill.style.width = `${gameState.confidence}%`;
    value.textContent = gameState.confidence;
    
    // Меняем цвет в зависимости от уровня
    if (gameState.confidence >= 70) {
        fill.style.background = 'linear-gradient(90deg, #32CD32 0%, #228B22 100%)';
    } else if (gameState.confidence >= 40) {
        fill.style.background = 'linear-gradient(90deg, #4a90e2 0%, #5aa0f2 100%)';
    } else {
        fill.style.background = 'linear-gradient(90deg, #DC143C 0%, #FF6347 100%)';
    }
}

function endLesson() {
    const questionContainer = document.querySelector('.question-container');
    if (!questionContainer) return;
    
    questionContainer.innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <h2 style="color: #4a90e2; font-size: 2.5em; margin-bottom: 20px;">🔔 Звонок!</h2>
            <p style="font-size: 1.5em; margin-bottom: 30px;">Урок окончен!</p>
            <div style="background: #2a2a3e; padding: 20px; border: 3px solid #4a90e2; margin-bottom: 20px;">
                <p style="font-size: 1.2em; margin-bottom: 10px;">Правильных ответов: ${gameState.questionsAnswered} из ${questions.length}</p>
                <p style="font-size: 1.2em;">Финальная уверенность: ${gameState.confidence}</p>
            </div>
            <button id="back-to-menu-from-lesson" class="pixel-btn">В главное меню</button>
        </div>
    `;
    
    // Небольшая задержка для того, чтобы кнопка успела появиться в DOM
    setTimeout(() => {
        const backBtn = document.getElementById('back-to-menu-from-lesson');
        if (backBtn) {
            backBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                showScreen('main-menu');
            });
        }
    }, 100);
}


