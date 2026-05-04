import { quizData } from "./questions.js";

alert("JS KE-LOAD");
console.log("JS JALAN");

console.log("SCRIPT MASUK START");
console.log("OPENING OK");
console.log("NAME SCREEN OK");

let soundOn = true;
let musicOn = true;
let isPlaying = false;
let musicFade;
let isInGame = false;



window.addEventListener("error", (e) => {
    console.log("ERROR:", e.message, e.lineno);
});


const particles = document.querySelector(".particles");

if (particles) {
    for (let i = 0; i < 30; i++) {
        let span = document.createElement("span");

        span.style.left = Math.random() * 100 + "%";
        span.style.animationDuration = (5 + Math.random() * 5) + "s";
        span.style.opacity = Math.random();

        particles.appendChild(span);
    }
}

function playSound(sound) {
    if (!soundOn || !sound) return;

    sound.volume = 1; // reset biar tidak stuck kecil
    sound.currentTime = 0;
    sound.play();
}

function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

let currentIndex = 0;
let score = 0;
let lives = 3;

let timer;
let timeLeft = 30;
let playerName = "Player";
let playerId = "";
let mode = "";
let selectedSub = "";
let selectedLevel = 1;
let selectedCategory = "";
let warningPlayed = false;
let selectedQuestions = [];


const quizContainer = document.getElementById("quizContainer");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");
const clickSound = document.getElementById("clickSound");
const questionEl = document.getElementById("question");
const answerBtn = document.getElementById("answer-buttons");
const resultEl = document.getElementById("result");
const playerDisplay = document.getElementById("playerDisplay");
const scoreDisplay = document.getElementById("scoreDisplay");
const correctSound = document.getElementById("correctSound");
const wrongSound = document.getElementById("wrongSound");
const startSound = document.getElementById("startSound");
const timerSound = document.getElementById("timerSound");
const resultSound = document.getElementById("resultSound");
const openingSound = document.getElementById("openingSound");
const settingBtn = document.getElementById("settingBtn");
const settingPanel = document.getElementById("settingPanel");
const bgMusic = document.getElementById("bgMusic");
const confirmBox = document.getElementById("exitConfirm");
const yesExit = document.getElementById("yesExit");
const noExit = document.getElementById("noExit");
const overlay = document.getElementById("settingOverlay");
const modeSelect = document.querySelector(".mode-select");
const formArea = document.getElementById("formArea");
const gameOverSound = document.getElementById("gameOverSound");




let shuffledQuestions = [];
let globalQuestionPool = [];


function showScreen(screen) {
    const formArea = document.getElementById("formArea");
    const modeSelect = document.querySelector(".mode-select");
    const categoryScreen = document.getElementById("categoryScreen"); // 🔥 TAMBAH INI

    // sembunyikan semua layar
    categoryScreen.style.display = "none";
    quizContainer.style.display = "none";
    resultEl.style.display = "none";
    formArea.style.display = "none";
    modeSelect.style.display = "none";

    // tampilkan layar target
    screen.style.display = "flex";
}

function startQuiz() {
	lives = 3;
updateLivesUI();

    isPlaying = true;
    isInGame = true;

    document.getElementById("backArrow").style.display = "block"; // ✅ TAMBAH

    fadeOutMusic();


    currentIndex = 0;
    score = 0;

    // 🔥 cukup sekali saja
    if (!globalQuestionPool || globalQuestionPool.length === 0) {
        initQuestionPool();
    }

    if (selectedCategory === "acak") {
        selectedQuestions = globalQuestionPool.splice(0, 10);
    } else {
        selectedQuestions = shuffle(quizData[selectedCategory]).slice(0, 10);
    }

    shuffledQuestions = selectedQuestions;

    document.getElementById("categoryScreen").style.display = "none";
    quizContainer.style.display = "block";

    showQuestion();
}

function initQuestionPool() {
    globalQuestionPool = shuffle(Object.values(quizData).flat());
}

function shuffle(array) {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function showQuestion() {
    stopTimerSound(); // 🔥 reset paksa setiap soal
    timeLeft = 30; // 🔥 pastikan tiap soal reset ke 30

questionEl.classList.remove("question-anim");
void questionEl.offsetWidth;
questionEl.classList.add("question-anim");

progressText.innerText = `Soal ${currentIndex + 1} / ${shuffledQuestions.length}`;

let progressPercent = ((currentIndex + 1) / shuffledQuestions.length) * 100;


progressFill.style.width = progressPercent + "%";

    resetState();

    let q = shuffledQuestions[currentIndex];

    questionEl.innerText = q.question;
	
	let oldTimer = document.getElementById("timer");
if (oldTimer) oldTimer.remove();


	let shuffledAnswers = shuffleArray([...q.answers]);

answerBtn.style.pointerEvents = "auto";



shuffledAnswers.forEach((answer, index) => {

        const button = document.createElement("button");
        button.innerText = answer.text;
        button.classList.add("btn");

       button.dataset.correct = answer.correct;


        button.addEventListener("click", selectAnswer);
        answerBtn.appendChild(button);
		
		button.classList.add("answer-anim");
		button.style.animationDelay = (index * 0.1) + "s";

    });

    startTimer();
}

function resetState() {
    answerBtn.innerHTML = "";
    clearInterval(timer);
    stopTimerSound(); // 🔥 WAJIB TAMBAH
    timeLeft = 30;
    answerBtn.style.pointerEvents = "auto";
}

function startTimer() {
    stopTimerSound(); // 🔥 safety reset
    warningPlayed = false;

    let timerDisplay = document.getElementById("timer");

    if (!timerDisplay) {
        timerDisplay = document.createElement("p");
        timerDisplay.id = "timer";
        document.getElementById("quiz").prepend(timerDisplay);
    }

    let startTime = Date.now();
    let duration = 30000;

    timer = setInterval(() => {
        let elapsed = Date.now() - startTime;
        timeLeft = Math.ceil((duration - elapsed) / 1000);

        timerDisplay.innerText = `⏱️ Waktu: ${timeLeft}`;

        if (timeLeft <= 5) {
            timerDisplay.classList.add("danger");
        } else {
            timerDisplay.classList.remove("danger");
        }

        if (timeLeft === 10 && !warningPlayed) {
            timerSound.currentTime = 0;
            playSound(timerSound);
            warningPlayed = true;
        }

        if (elapsed >= duration) {
            clearInterval(timer);
            stopTimerSound();
            autoNext();
        }

    }, 100);
}


function selectAnswer(e) {
    clearInterval(timer);
    stopTimerSound();

    const selected = e.target;
    const correct = selected.dataset.correct === "true";

    // disable semua tombol
    Array.from(answerBtn.children).forEach(button => {
        button.disabled = true;

        if (button.dataset.correct === "true") {
            button.classList.add("correct");
        }
    });

    if (correct) {
        correctSound.currentTime = 0;
        playSound(correctSound);

        selected.classList.add("correct");
        score += 10;

        setTimeout(() => nextQuestion(), 800); // ✅ TAMBAH INI

    } else {
        wrongSound.currentTime = 0;
        playSound(wrongSound);

        selected.classList.add("wrong");

        lives--;
        updateLivesUI();

        if (lives <= 0) {
            setTimeout(() => gameOver(), 500);
            return;
        }

        setTimeout(() => nextQuestion(), 800);
    }

    // update score display
    let scores = JSON.parse(localStorage.getItem("leaderboard")) || [];
    let rank = getGlobalRanking(scores, playerName, score);

    scoreDisplay.innerHTML = `
        <span class="score-now">⭐ ${score}</span>
        <span class="score-rank">🎖️ #${rank}</span>
    `;
}


function showResult() {
	document.getElementById("backArrow").style.display = "block";


isPlaying = false;
isInGame = false;

resultSound.currentTime = 0;
playSound(resultSound);

    clearInterval(timer);

    quizContainer.style.display = "none";

    resultEl.classList.remove("hide");
    resultEl.style.display = "block"; // 🔥 TAMBAH INI

    progressFill.style.width = "100%";

    saveScore();

    let scores = JSON.parse(localStorage.getItem("leaderboard")) || [];
    let ranking = getGlobalRanking(scores, playerName, score);

    resultEl.innerHTML = `
    🎉 Quiz selesai!<br><br>
    👤 ${playerName} (ID${playerId})<br>
    ⭐ Score: <b>${score} poin</b><br>
    🏆 Ranking: #${ranking}<br><br>

    <button id="playAgainBtn" class="result-btn">🔁 Main Lagi</button>
    <button id="backToMenuBtn" class="result-btn">🏠 Menu</button>
`;

}
window.addEventListener("DOMContentLoaded", () => {

const toggleDark = document.getElementById("darkModeToggle");

// default
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    document.body.classList.remove("light");
    toggleDark.checked = true;
} else {
    document.body.classList.add("light");
    document.body.classList.remove("dark");
}

if (toggleDark) {
    toggleDark.addEventListener("change", () => {
        if (toggleDark.checked) {
            document.body.classList.add("dark");
            document.body.classList.remove("light");
            localStorage.setItem("theme", "dark");
        } else {
            document.body.classList.add("light");
            document.body.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    });
}

document.addEventListener("click", (e) => {
    if (e.target.id === "playAgainBtn") {
        playSound(clickSound);
        restartGame();
    }

    if (e.target.id === "backToMenuBtn") {
        playSound(clickSound);
        backToMenu();
    }
});


const newPlayerBtn = document.getElementById("newPlayerBtn");
const oldPlayerBtn = document.getElementById("oldPlayerBtn");

newPlayerBtn.addEventListener("click", () => {
    mode = "new";
    formArea.style.display = "flex";
    modeSelect.style.display = "none";

    document.getElementById("playerId").style.display = "none"; // sembunyiin ID
});

oldPlayerBtn.addEventListener("click", () => {
    mode = "old";
    formArea.style.display = "flex";
    modeSelect.style.display = "none";

    document.getElementById("playerId").style.display = "block"; // tampilkan ID
});



const startBtn = document.getElementById("startGameBtn");
const idInput = document.getElementById("playerId");
const nameInput = document.getElementById("playerName");
const opening = document.getElementById("opening");
const nameScreen = document.getElementById("nameScreen");
const backBtn = document.getElementById("backArrow");
const categoryBtns = document.querySelectorAll(".categoryBtn");
const toggleSound = document.getElementById("toggleSound");
const toggleMusic = document.getElementById("toggleMusic");
const closeSetting = document.getElementById("closeSetting");



document.getElementById("backArrow").style.display = "none";

function restartGame() {
    currentIndex = 0;
    score = 0;
    timeLeft = 30;
    warningPlayed = false

    clearInterval(timer);
    stopTimerSound();

    resultEl.style.display = "none";
    quizContainer.style.display = "block";

    // reset soal biar fresh
    shuffledQuestions = [];

    startQuiz();
}

function backToMenu() {
	document.getElementById("backArrow").style.display = "none";

    resultEl.style.display = "none";
    quizContainer.style.display = "none";

    currentIndex = 0;
    score = 0;
    timeLeft = 30;
    warningPlayed = false;

    clearInterval(timer);
    stopTimerSound();

    isPlaying = false;
    isInGame = false;

    // 🔥 STOP SEMUA AUDIO GAME
    resultSound.pause();
    resultSound.currentTime = 0;

    correctSound.pause();
    wrongSound.pause();

    fadeOutMusic();

    document.getElementById("nameScreen").style.display = "none";
    document.getElementById("categoryScreen").style.display = "flex";

    if (musicOn) {
        fadeInMusic();
    }
}

if (yesExit && noExit) {
  yesExit.onclick = () => {
    playSound(clickSound);
    confirmBox.style.display = "none";

    // STOP GAME
    isInGame = false;
    clearInterval(timer);

    currentIndex = 0;
    score = 0;
    timeLeft = 30;

    shuffledQuestions = [];
    selectedQuestions = [];

    quizContainer.style.display = "none";
    resultEl.style.display = "none";

    document.getElementById("categoryScreen").style.display = "flex";

    stopTimerSound();

    correctSound.pause();
    wrongSound.pause();
    resultSound.pause();
    startSound.pause();

    correctSound.currentTime = 0;
    wrongSound.currentTime = 0;
    resultSound.currentTime = 0;
    startSound.currentTime = 0;

    // 🔥 INI FIX UTAMA MUSIC
    if (musicOn) {
        setTimeout(() => {
            bgMusic.currentTime = 0;
            bgMusic.play().catch(() => {});
            fadeInMusic();
        }, 50); // kasih jeda biar fadeOut selesai
    }
};



    noExit.onclick = () => {
        playSound(clickSound);
        confirmBox.style.display = "none";
    };
}


if (confirmBox) {
    confirmBox.addEventListener("click", (e) => {
        if (e.target === confirmBox) {
            confirmBox.style.display = "none";
        }
    });
}

settingBtn.addEventListener("click", () => {
    settingPanel.classList.add("show");
    overlay.classList.add("show");
});

closeSetting.addEventListener("click", closeSettingPanel);

overlay.addEventListener("click", closeSettingPanel);

toggleSound.addEventListener("change", () => {
    soundOn = toggleSound.checked;

    if (!soundOn) {
        smoothStopAllSounds();
    } else {
        const allSounds = [
            clickSound,
            correctSound,
            wrongSound,
            timerSound,
            resultSound,
            startSound,
            openingSound
        ];

        allSounds.forEach(sound => {
            if (!sound) return;
            sound.pause();
            sound.currentTime = 0;
        });
    }
});


toggleMusic.addEventListener("change", () => {
    musicOn = toggleMusic.checked;

    console.log("Music:", musicOn);

    if (!musicOn) {
        fadeOutMusic();
        return;
    }

    // 🔥 hanya nyala kalau di MENU, bukan di game
    if (!isInGame) {
        fadeInMusic();
    }
});


settingBtn.style.display = "none";

console.log("Jumlah tombol kategori:", categoryBtns.length);

setTimeout(() => {
    opening.style.display = "none";
    nameScreen.style.display = "flex";

    document.getElementById("backArrow").style.display = "none";

    // 🔥 TAMBAH INI
    if (musicOn) {
        fadeInMusic();
    }
}, 3000);



backBtn.onclick = () => {
    playSound(clickSound);

    // 🔥 kalau masih dalam game → confirm
    if (isInGame) {
        confirmBox.style.display = "flex";
        return;
    }

    // 🔥 kalau di result → balik ke menu
    if (resultEl.style.display === "block") {
        backToMenu();
        return;
    }

    // 🔥 selain itu → home awal
    goHome();
};

function goHome() {

    isInGame = false;
    isPlaying = false;

    clearInterval(timer);
    stopTimerSound();

    currentIndex = 0;
    score = 0;
    timeLeft = 30;

    shuffledQuestions = [];
    selectedQuestions = [];

    quizContainer.style.display = "none";
    resultEl.style.display = "none";

    showModeSelect(); // 🔥 INI FIX NYA

    nameScreen.style.display = "none";
    backBtn.style.display = "none";
}

function resetGameUI() {
    settingBtn.style.display = "block";
}

    function checkInput() {
    if (mode === "new") {
        if (nameInput.value.trim() !== "") {
            startBtn.classList.add("active");
        } else {
            startBtn.classList.remove("active");
        }
    }

    if (mode === "old") {
        if (
            nameInput.value.trim() !== "" &&
            idInput.value.trim() !== ""
        ) {
            startBtn.classList.add("active");
        } else {
            startBtn.classList.remove("active");
        }
    }
}
    nameInput.addEventListener("input", checkInput);
    idInput.addEventListener("input", checkInput);

    startBtn.addEventListener("click", () => {
    playSound(clickSound);

    handleStart();
});

	
	categoryBtns.forEach(btn => {
    btn.addEventListener("click", () => {
       

        playSound(clickSound);


        selectedCategory = btn.dataset.cat;

        console.log("Kategori dipilih:", selectedCategory);

        startQuiz();
    });
});

});
function showModeSelect() {
    modeSelect.style.display = "flex";
    formArea.style.display = "none";
    document.getElementById("categoryScreen").style.display = "none";

    // 🔥 FIX MUSIK MASUK AKSES PEMAIN
    if (musicOn && !isInGame) {
        fadeInMusic();
    }
}

function startGame() {
    document.getElementById("nameScreen").style.display = "none";
    document.getElementById("playerInfo").style.display = "flex";

    playerDisplay.innerText = `👤 ${playerName} (ID${playerId})`;

    scoreDisplay.innerHTML = `
        <span class="score-now">⭐ ${score}</span>
        <span class="score-rank">🎖️ -</span>
    `;

    document.getElementById("categoryScreen").style.display = "block";

    // 🔥 PASTIKAN MUSIC HIDUP DI ACCESS PLAYER AREA
    if (musicOn && !isInGame) {
        fadeInMusic();
    }
}


function showLeaderboard(scores) {
    let html = `<br><br>🏆 Leaderboard:<br>`;

    scores.forEach((player, index) => {
        html += `${index + 1}. ${player.name} (ID${player.id}) - ${player.score} poin<br>`;
    });
    resultEl.innerHTML += html;
}
console.log("JS LOADED");

function handleStart() {
    console.log("TOMBOL DIKLIK");

    if (!mode) {
        alert("Pilih mode dulu!");
        return;
    }

    const nameInput = document.getElementById("playerName");
    const idInput = document.getElementById("playerId");

    let name = nameInput.value.trim();
    let id = idInput.value.trim();

    if (!name) {
        alert("Masukkan nama!");
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    if (mode === "new") {
        let nameExists = users.some(u => u.name === name);
        if (nameExists) {
            alert("Nama sudah dipakai!");
            return;
        }

        let lastId = localStorage.getItem("lastPlayerId") || 0;
        lastId = parseInt(lastId) + 1;

        localStorage.setItem("lastPlayerId", lastId);

        let newId = lastId.toString();

        users.push({ name: name, id: newId });
        localStorage.setItem("users", JSON.stringify(users));

        alert("ID kamu: " + newId + "\n(Simpan ya!)");

        playerName = name;
        playerId = newId;
    }

    if (mode === "old") {
        let user = users.find(u => u.name === name && u.id === id);

        if (!user) {
            alert("Nama atau ID salah!");
            return;
        }

        playerName = user.name;
        playerId = user.id;
    }

    startGame();
}


function getRankingRealtime() {
    let scores = JSON.parse(localStorage.getItem("leaderboard")) || [];

    // tambahkan skor sementara
    scores.push({
        name: playerName,
        score: score
    });

    // urutkan
    scores.sort((a, b) => b.score - a.score);

    // cari posisi berdasarkan nama + skor
    let rank = scores.findIndex(p => 
        p.name === playerName && p.score === score
    );

    return rank !== -1 ? rank + 1 : "-";
}

function getRankEmoji(rank) {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return "🎖️";
}

function autoNext() {
    stopTimerSound();

    lives--;
    updateLivesUI();

    if (lives <= 0) {
        gameOver(); // 🔥 LANGSUNG
        return;
    }

    currentIndex++;

    if (currentIndex < shuffledQuestions.length) {
        showQuestion();
    } else {
        showResult();
    }
}


function nextQuestion() {
    if (lives <= 0) return; // 🛑 STOP kalau sudah mati

    stopTimerSound();
    currentIndex++;

    if (currentIndex < shuffledQuestions.length) {
        showQuestion();
    } else {
        showResult();
    }
}

function getGlobalRanking(scores, name, score) {
    let sorted = [...scores];
    sorted.push({ name, score });

    sorted.sort((a, b) => b.score - a.score);

    return sorted.findIndex(p => p.name === name && p.score === score) + 1;
}

function saveScore() {
    let scores = JSON.parse(localStorage.getItem("leaderboard")) || [];

    
    let existing = scores.find(p => p.id === playerId);

    if (existing) {
        if (score > existing.score) {
            existing.score = score;
        }
    } else {
        scores.push({
            name: playerName,
            id: playerId,
            score: score
        });
    }

    scores.sort((a, b) => b.score - a.score);
    scores = scores.slice(0, 5);

    localStorage.setItem("leaderboard", JSON.stringify(scores));
}
lucide.createIcons();

function fadeInMusic() {
    clearInterval(musicFade);

    if (!bgMusic || !musicOn) return;

    bgMusic.pause(); // reset dulu biar clean
    bgMusic.currentTime = 0;

    bgMusic.play().catch(() => {});

    let vol = 0;
    bgMusic.volume = 0;

    musicFade = setInterval(() => {
        if (vol < 0.4) {
            vol += 0.02;
            bgMusic.volume = vol;
        } else {
            clearInterval(musicFade);
        }
    }, 50);
}

function fadeOutMusic() {
    clearInterval(musicFade);

    if (!bgMusic) return;

    musicFade = setInterval(() => {
        let vol = bgMusic.volume;

        if (vol > 0.02) {
            vol = Math.max(0, vol - 0.02);
            bgMusic.volume = vol;
        } else {
            bgMusic.volume = 0;
            bgMusic.pause();
            clearInterval(musicFade);
        }
    }, 50);
}
function closeSettingPanel() {
    settingPanel.classList.remove("show");
    overlay.classList.remove("show");
}
function stopTimerSound() {
    timerSound.pause();
    timerSound.currentTime = 0;
}
function fadeOutSound(audio, duration = 200) {
    if (!audio) return;

    let volume = audio.volume;
    let step = volume / (duration / 20);

    let fade = setInterval(() => {
        volume -= step;

        if (volume <= 0) {
            audio.volume = 0;
            audio.pause();
            audio.currentTime = 0;
            clearInterval(fade);
        } else {
            audio.volume = volume;
        }
    }, 20);
}
function smoothStopAllSounds() {
    const allSounds = [
        clickSound,
        correctSound,
        wrongSound,
        timerSound,
        resultSound,
        startSound,
        openingSound
    ];

    allSounds.forEach(sound => {
        if (!sound) return;
        fadeOutSound(sound, 180); // 🔥 cepat tapi smooth
    });
}
function isGameRunning() {
    return isInGame && quizContainer.style.display === "block";
}

function updateLivesUI() {
    let livesEl = document.getElementById("livesDisplay");

    if (!livesEl) {
        livesEl = document.createElement("div");
        livesEl.id = "livesDisplay";
        document.getElementById("quiz").prepend(livesEl);
    }

    let hearts = "";

    for (let i = 0; i < 3; i++) {
        if (i < lives) {
            hearts += `<span class="heart full">❤️</span>`;
        } else {
            hearts += `<span class="heart empty">🤍</span>`;
        }
    }

    livesEl.innerHTML = `
        <div class="lives-wrapper">
            ${hearts}
        </div>
    `;
}

function gameOver() {
    clearInterval(timer);
    stopTimerSound();

    isPlaying = false;
    isInGame = false;

    if (gameOverSound) {
        gameOverSound.volume = 1;
        gameOverSound.currentTime = 0;

        gameOverSound.play().catch(err => {
            console.log("GameOver sound blocked:", err);
        });
    }

    quizContainer.style.display = "none";
    resultEl.style.display = "block";

    resultEl.innerHTML = `
        💀 GAME OVER 💀<br><br>
        👤 ${playerName} (ID${playerId})<br>
        ⭐ Score: <b>${score}</b><br><br>

        <button id="playAgainBtn" class="result-btn">🔁 Coba Lagi</button>
        <button id="backToMenuBtn" class="result-btn">🏠 Menu</button>
    `;
}