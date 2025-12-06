// Игровое состояние
const gameState = {
    player: {
        name: '',
        class: null,
        character: ''
    },
    stats: {
        mood: 50,
        reputation: 50,
        grades: 50
    },
    currentScene: 0,
    scenes: ['running', 'test', 'canteen', 'break', 'lab'],
    gameData: {
        runningSuccess: false,
        testChoice: null,
        canteenSuccess: false,
        breakChoice: null,
        labSuccess: false
    }
};

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    initCharacterCreation();
    initGameButtons();
});

// Создание персонажа
function initCharacterCreation() {
    const nameInput = document.getElementById('player-name');
    const classButtons = document.querySelectorAll('.class-btn');
    const characterButtons = document.querySelectorAll('.character-btn');
    const startBtn = document.getElementById('start-game-btn');

    nameInput.addEventListener('input', () => {
        gameState.player.name = nameInput.value.trim();
        checkStartButton();
    });

    classButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            classButtons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            gameState.player.class = parseInt(btn.dataset.class);
            checkStartButton();
        });
    });

    characterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            characterButtons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            gameState.player.character = btn.dataset.character;
            checkStartButton();
        });
    });

    startBtn.addEventListener('click', startGame);
}

function checkStartButton() {
    const startBtn = document.getElementById('start-game-btn');
    if (gameState.player.name && gameState.player.class && gameState.player.character) {
        startBtn.disabled = false;
    } else {
        startBtn.disabled = true;
    }
}

function startGame() {
    document.getElementById('character-creation').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    updateStats();
    showScene(0);
}

// Управление сценами
function showScene(index) {
    const scenes = document.querySelectorAll('.scene');
    scenes.forEach(scene => scene.classList.add('hidden'));

    const sceneId = `scene-${gameState.scenes[index]}`;
    const scene = document.getElementById(sceneId);
    if (scene) {
        scene.classList.remove('hidden');
        gameState.currentScene = index;

        // Инициализация конкретной сцены
        switch (gameState.scenes[index]) {
            case 'running':
                initRunningGame();
                break;
            case 'test':
                initTestScene();
                break;
            case 'canteen':
                initCanteenGame();
                break;
            case 'break':
                initBreakScene();
                break;
            case 'lab':
                initLabGame();
                break;
        }
    }
}

function nextScene() {
    if (gameState.currentScene < gameState.scenes.length - 1) {
        showScene(gameState.currentScene + 1);
    } else {
        showFinal();
    }
}

// Обновление статистики
function updateStats() {
    const moodBar = document.getElementById('mood-bar');
    const reputationBar = document.getElementById('reputation-bar');
    const gradesBar = document.getElementById('grades-bar');

    moodBar.style.width = `${gameState.stats.mood}%`;
    reputationBar.style.width = `${gameState.stats.reputation}%`;
    gradesBar.style.width = `${gameState.stats.grades}%`;

    document.getElementById('mood-value').textContent = gameState.stats.mood;
    document.getElementById('reputation-value').textContent = gameState.stats.reputation;
    document.getElementById('grades-value').textContent = gameState.stats.grades;
}

function changeStats(mood, reputation, grades) {
    gameState.stats.mood = Math.max(0, Math.min(100, gameState.stats.mood + mood));
    gameState.stats.reputation = Math.max(0, Math.min(100, gameState.stats.reputation + reputation));
    gameState.stats.grades = Math.max(0, Math.min(100, gameState.stats.grades + grades));
    updateStats();
}

// Сцена 1: Бег по коридору
function initRunningGame() {
    const player = document.getElementById('player-runner');
    const jumpBtn = document.getElementById('jump-btn');
    const obstacles = ['obstacle1', 'obstacle2', 'obstacle3'];
    let timeLeft = 20;
    let isJumping = false;
    let obstacleInterval;
    let gameActive = true;

    player.classList.remove('jumping');
    obstacles.forEach(id => {
        const obs = document.getElementById(id);
        obs.style.display = 'none';
        obs.classList.remove('active');
    });

    const timer = document.getElementById('time-left');
    timer.textContent = timeLeft;

    const countdown = setInterval(() => {
        if (!gameActive) {
            clearInterval(countdown);
            return;
        }
        timeLeft--;
        timer.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(countdown);
            clearInterval(obstacleInterval);
            endRunningGame(false);
        }
    }, 1000);

    let obstacleIndex = 0;
    obstacleInterval = setInterval(() => {
        if (!gameActive) return;
        
        const obsId = obstacles[obstacleIndex % obstacles.length];
        const obs = document.getElementById(obsId);
        obs.style.display = 'block';
        obs.style.right = '-100px';
        obs.classList.add('active');

        setTimeout(() => {
            if (!gameActive) return;
            const obsRect = obs.getBoundingClientRect();
            const playerRect = player.getBoundingClientRect();
            
            if (obsRect.left < playerRect.right && obsRect.right > playerRect.left && 
                obsRect.top < playerRect.bottom && obsRect.bottom > playerRect.top && !isJumping) {
                endRunningGame(false);
            }
        }, 1000);

        obstacleIndex++;
    }, 2000);

    jumpBtn.onclick = () => {
        if (!gameActive || isJumping) return;
        isJumping = true;
        player.classList.add('jumping');
        
        setTimeout(() => {
            player.classList.remove('jumping');
            isJumping = false;
        }, 500);
    };

    // Автоматический успех через 20 секунд
    setTimeout(() => {
        if (gameActive) {
            endRunningGame(true);
        }
    }, 20000);
}

function endRunningGame(success) {
    gameState.gameData.runningSuccess = success;
    
    if (success) {
        changeStats(10, 5, 0);
        setTimeout(() => {
            alert('✅ Ты успел на урок! Учитель доволен.');
            nextScene();
        }, 500);
    } else {
        changeStats(-15, -10, -5);
        setTimeout(() => {
            alert('❌ Ты опоздал! Учитель недоволен.');
            nextScene();
        }, 500);
    }
}

// Сцена 2: Контрольная
function initTestScene() {
    const choiceButtons = document.querySelectorAll('#scene-test .choice-btn');
    const resultDiv = document.getElementById('test-result');
    resultDiv.classList.add('hidden');

    choiceButtons.forEach(btn => {
        btn.onclick = () => {
            const choice = btn.dataset.choice;
            gameState.gameData.testChoice = choice;
            showTestResult(choice);
        };
    });
}

function showTestResult(choice) {
    const resultDiv = document.getElementById('test-result');
    resultDiv.classList.remove('hidden');
    
    const character = gameState.player.character;
    let message = '';
    let mood = 0, reputation = 0, grades = 0;

    switch (choice) {
        case 'cheat':
            if (character === 'хулиган') {
                message = '😈 Ты мастерски списал! Никто не заметил.';
                mood = 10;
                reputation = -5;
                grades = 15;
            } else if (character === 'отличник') {
                message = '😰 Ты попытался списать, но тебя поймали!';
                mood = -20;
                reputation = -15;
                grades = -10;
            } else {
                message = '🤫 Ты списал, но чувствуешь себя неловко.';
                mood = -5;
                reputation = -5;
                grades = 10;
            }
            break;
        case 'honest':
            if (character === 'отличник' || character === 'гений') {
                message = '✨ Ты блестяще ответил! Получил 5!';
                mood = 15;
                reputation = 10;
                grades = 20;
            } else {
                message = '📝 Ты ответил честно, но не всё знал. Получил 3.';
                mood = 0;
                reputation = 5;
                grades = 5;
            }
            break;
        case 'distract':
            if (character === 'хулиган') {
                message = '🎭 Ты отвлёк учителя шуткой! Контрольную отменили!';
                mood = 20;
                reputation = 10;
                grades = 0;
            } else {
                message = '😅 Попытка отвлечь не удалась. Учитель разозлился.';
                mood = -10;
                reputation = -10;
                grades = -5;
            }
            break;
    }

    resultDiv.textContent = message;
    changeStats(mood, reputation, grades);
    
    setTimeout(() => {
        nextScene();
    }, 3000);
}

// Сцена 3: Столовая
function initCanteenGame() {
    const foodItems = document.querySelectorAll('.food-item');
    const tray = document.getElementById('tray');
    const auntText = document.getElementById('aunt-text');
    const canteenTimer = document.getElementById('canteen-time');
    let timeLeft = 15;
    let collectedItems = [];
    let gameActive = true;

    tray.innerHTML = '';
    foodItems.forEach(item => {
        item.classList.remove('collected');
        item.onclick = () => {
            if (!gameActive || item.classList.contains('collected')) return;
            
            const food = item.dataset.food;
            if (!collectedItems.includes(food)) {
                collectedItems.push(food);
                item.classList.add('collected');
                
                const trayItem = document.createElement('div');
                trayItem.className = 'tray-item';
                trayItem.textContent = item.textContent;
                tray.appendChild(trayItem);

                if (collectedItems.length === 5) {
                    endCanteenGame(true);
                }
            }
        };
    });

    const timer = setInterval(() => {
        if (!gameActive) {
            clearInterval(timer);
            return;
        }
        timeLeft--;
        canteenTimer.textContent = timeLeft;

        const messages = [
            'Быстрее!',
            'Я жду!',
            'Сколько можно!',
            'Последнее предупреждение!',
            'Всё! Я ухожу!'
        ];
        const messageIndex = Math.floor((15 - timeLeft) / 3);
        if (messageIndex < messages.length) {
            auntText.textContent = messages[messageIndex];
        }

        if (timeLeft <= 0) {
            clearInterval(timer);
            endCanteenGame(false);
        }
    }, 1000);
}

function endCanteenGame(success) {
    gameState.gameData.canteenSuccess = success;
    
    if (success) {
        changeStats(15, 10, 0);
        setTimeout(() => {
            alert('✅ Ты успел собрать поднос! Тётя Галя довольна.');
            nextScene();
        }, 500);
    } else {
        changeStats(-10, -5, 0);
        setTimeout(() => {
            alert('❌ Ты не успел! Тётя Галя ушла, остался голодным.');
            nextScene();
        }, 500);
    }
}

// Сцена 4: Перемена
function initBreakScene() {
    const choiceButtons = document.querySelectorAll('#scene-break .choice-btn');
    const resultDiv = document.getElementById('break-result');
    resultDiv.classList.add('hidden');

    choiceButtons.forEach(btn => {
        btn.onclick = () => {
            const choice = btn.dataset.choice;
            gameState.gameData.breakChoice = choice;
            showBreakResult(choice);
        };
    });
}

function showBreakResult(choice) {
    const resultDiv = document.getElementById('break-result');
    resultDiv.classList.remove('hidden');
    
    const character = gameState.player.character;
    let message = '';
    let mood = 0, reputation = 0, grades = 0;

    switch (choice) {
        case 'chat':
            message = '💬 Ты хорошо поболтал с друзьями. Настроение улучшилось!';
            mood = 15;
            reputation = 10;
            break;
        case 'play':
            if (character === 'хулиган') {
                message = '⚽ Ты отлично поиграл! Но случайно разбил окно...';
                mood = 10;
                reputation = -5;
                grades = -5;
            } else {
                message = '⚽ Ты поиграл в мяч. Было весело!';
                mood = 20;
                reputation = 5;
            }
            break;
        case 'sleep':
            message = '😴 Ты поспал на перемене. Отдохнул, но пропустил общение.';
            mood = 10;
            reputation = -5;
            break;
        case 'argue':
            if (character === 'хулиган') {
                message = '🤬 Ты поспорил и выиграл спор! Все тебя уважают.';
                mood = 5;
                reputation = 15;
            } else {
                message = '😰 Спор закончился конфликтом. Настроение испорчено.';
                mood = -15;
                reputation = -10;
            }
            break;
    }

    resultDiv.textContent = message;
    changeStats(mood, reputation, grades);
    
    setTimeout(() => {
        nextScene();
    }, 3000);
}

// Сцена 5: Лабораторная
function initLabGame() {
    const reagents = document.querySelectorAll('.reagent');
    const selectedDiv = document.getElementById('selected-reagents');
    const mixBtn = document.getElementById('mix-btn');
    const resetBtn = document.getElementById('reset-lab-btn');
    let selectedSequence = [];

    selectedDiv.innerHTML = '<p>Нажми на реагенты в правильном порядке</p>';

    reagents.forEach(reagent => {
        reagent.classList.remove('used');
        reagent.onclick = () => {
            if (reagent.classList.contains('used')) return;
            
            const reagentNum = reagent.dataset.reagent;
            selectedSequence.push(reagentNum);
            reagent.classList.add('used');

            const selectedItem = document.createElement('div');
            selectedItem.className = 'selected-reagent';
            selectedItem.textContent = `Реагент ${String.fromCharCode(64 + parseInt(reagentNum))}`;
            selectedDiv.appendChild(selectedItem);

            if (selectedSequence.length === 4) {
                mixBtn.disabled = false;
            } else {
                mixBtn.disabled = true;
            }
        };
    });

    mixBtn.disabled = true;

    mixBtn.onclick = () => {
        if (selectedSequence.length !== 4) return;
        const correctSequence = ['1', '2', '3', '4'];
        const isCorrect = JSON.stringify(selectedSequence) === JSON.stringify(correctSequence);
        endLabGame(isCorrect);
    };

    resetBtn.onclick = () => {
        selectedSequence = [];
        selectedDiv.innerHTML = '<p>Нажми на реагенты в правильном порядке</p>';
        reagents.forEach(r => r.classList.remove('used'));
        mixBtn.disabled = true;
    };
}

function endLabGame(success) {
    gameState.gameData.labSuccess = success;
    const resultDiv = document.getElementById('lab-result');
    resultDiv.classList.remove('hidden');

    if (success) {
        resultDiv.textContent = '✅ Отлично! Реакция прошла успешно! Учитель в восторге!';
        changeStats(10, 15, 20);
    } else {
        resultDiv.textContent = '💥 БАБАХ! Ты смешал реагенты неправильно! Кабинет в дыму!';
        changeStats(-20, -20, -15);
    }
    
    setTimeout(() => {
        showFinal();
    }, 3000);
}

// Финал
function showFinal() {
    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('final-screen').classList.add('active');

    const finalMood = document.getElementById('final-mood');
    const finalReputation = document.getElementById('final-reputation');
    const finalGrades = document.getElementById('final-grades');
    const finalMessage = document.getElementById('final-message');
    const finalTitle = document.getElementById('final-title');

    finalMood.textContent = gameState.stats.mood;
    finalReputation.textContent = gameState.stats.reputation;
    finalGrades.textContent = gameState.stats.grades;

    // Определение концовки
    const totalScore = gameState.stats.mood + gameState.stats.reputation + gameState.stats.grades;
    let ending = '';

    if (gameState.gameData.labSuccess === false) {
        ending = '💥 Ты случайно взорвал кабинет химии! Директор вызвал родителей. Но зато было весело!';
        finalTitle.textContent = '💥 Взрывной финал!';
    } else if (totalScore >= 240) {
        ending = '🌟 Твой день прошёл идеально! Ты стал легендой школы! Все тебя уважают и восхищаются!';
        finalTitle.textContent = '🌟 Идеальный день!';
    } else if (totalScore >= 180) {
        ending = '✨ Отличный день! Ты хорошо справился со всеми испытаниями!';
        finalTitle.textContent = '✨ Отличный результат!';
    } else if (totalScore >= 120) {
        ending = '😊 Нормальный день. Были взлёты и падения, но в целом неплохо.';
        finalTitle.textContent = '😊 Обычный день';
    } else if (gameState.stats.reputation < 30) {
        ending = '😤 Тебя выгнали с урока! Но ты не расстроился - зато было интересно!';
        finalTitle.textContent = '😤 Проблемный день';
    } else {
        ending = '😅 Сложный день... Но ты выжил! Завтра будет лучше!';
        finalTitle.textContent = '😅 Выжил!';
    }

    finalMessage.textContent = ending;

    // Кнопки финала
    document.getElementById('restart-btn').onclick = () => {
        resetGame();
        document.getElementById('final-screen').classList.remove('active');
        document.getElementById('game-screen').classList.add('active');
        showScene(0);
    };

    document.getElementById('new-character-btn').onclick = () => {
        resetGame();
        document.getElementById('final-screen').classList.remove('active');
        document.getElementById('character-creation').classList.add('active');
        document.getElementById('player-name').value = '';
        document.querySelectorAll('.class-btn, .character-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        document.getElementById('start-game-btn').disabled = true;
    };
}

function resetGame() {
    gameState.stats = { mood: 50, reputation: 50, grades: 50 };
    gameState.currentScene = 0;
    gameState.gameData = {
        runningSuccess: false,
        testChoice: null,
        canteenSuccess: false,
        breakChoice: null,
        labSuccess: false
    };
    updateStats();
}

// Инициализация кнопок
function initGameButtons() {
    // Кнопки уже инициализируются в соответствующих функциях сцен
}

