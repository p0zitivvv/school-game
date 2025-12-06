const gameDiv = document.getElementById('game');

const events = [
    {
        text: "Ты опоздал на урок. Что делать?",
        choices: ["Списать у соседа", "Извиниться", "Пропустить"],
        results: ["Учитель заметил списывание! -1 балл", "Учитель оценил честность +1 балл", "Пропустил урок, ничего не изменилось"]
    },
    {
        text: "Перемена! Чем займешься?",
        choices: ["Поиграть в мяч", "Поспать", "Поболтать с друзьями"],
        results: ["Весело провел время +1 настроение", "Отдохнул немного, настроение +1", "Провел время с друзьями +2 настроения"]
    },
    {
        text: "Контрольная! Как поступишь?",
        choices: ["Отвечать честно", "Списать", "Сдаться"],
        results: ["Отлично ответил! +2 балла", "Учитель заметил списывание! -1 балл", "Пропустил, -1 балл"]
    }
];

let step = 0;

function showEvent() {
    if(step >= events.length) {
        gameDiv.innerHTML = `
            <h2>День закончен!</h2>
            <button onclick="restart()">Сыграть снова</button>
        `;
        return;
    }

    let event = events[step];
    let html = `<p>${event.text}</p>`;
    event.choices.forEach((choice, index) => {
        html += `<button onclick="choose(${index})">${choice}</button>`;
    });

    gameDiv.innerHTML = html;
}

function choose(index) {
    let event = events[step];
    alert(event.results[index]);
    step++;
    showEvent();
}

function restart() {
    step = 0;
    showEvent();
}

document.getElementById('startBtn').onclick = showEvent;
