let questions = [];
let currentIndex = 0;
let score = 0;
let selectedOptionIndex = null;
let userAnswers = [];

let timerInterval;
let timeLeft = 30;

// UI Elements
const startBox = document.getElementById("start-box");
const startBtn = document.getElementById("start-btn");
const quizBox = document.getElementById("quiz-box");
const questionNumberEl = document.getElementById("question-number");
const questionTextEl = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const nextBtn = document.getElementById("next-btn");
const exitBtn = document.getElementById("exit-btn");
const resultBox = document.getElementById("result-box");
const finalScoreEl = document.getElementById("final-score");
const restartBtn = document.getElementById("restart-btn");
const reviewBtn = document.getElementById("review-btn");
const reviewBox = document.getElementById("review-box");
const reviewContainer = document.getElementById("review-container");
const backBtn = document.getElementById("back-btn");

// Fisher–Yates Shuffle
function shuffleArray(arr) {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Load a question
function loadQuestion() {
  const currentQ = questions[currentIndex];
  if (!currentQ) return;

  questionNumberEl.textContent = `Question ${currentIndex + 1} of ${questions.length}`;
  questionTextEl.textContent = currentQ.question;
  optionsContainer.innerHTML = "";

  const labels = ["A", "B", "C", "D"];
  currentQ.options.forEach((option, index) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.innerHTML = `<strong>${labels[index]}.</strong> ${option}`;
    btn.onclick = () => selectOption(btn, index);
    optionsContainer.appendChild(btn);
  });

  document.getElementById("progress-bar").style.width = `${((currentIndex) / questions.length) * 100}%`;
  nextBtn.disabled = true;

  startTimer();
}

// Option selection logic
function selectOption(button, index) {
  const allBtns = document.querySelectorAll(".option-btn");
  allBtns.forEach((btn) => btn.classList.remove("selected"));
  button.classList.add("selected");

  selectedOptionIndex = index;
  nextBtn.disabled = false;
}

// Next question logic
nextBtn.onclick = () => {
  stopTimer();

  userAnswers.push(selectedOptionIndex);

  if (selectedOptionIndex === questions[currentIndex].answer) {
    score++;
  }

  currentIndex++;
  selectedOptionIndex = null;

  if (currentIndex < questions.length) {
    loadQuestion();
  } else {
    showResult();
  }
};

// Final result screen
function showResult() {
  stopTimer();
  quizBox.classList.add("hidden");
  resultBox.classList.remove("hidden");
  finalScoreEl.textContent = `You scored ${score} out of ${questions.length}.`;
  document.getElementById("progress-bar").style.width = `100%`;
}

// Restart logic
restartBtn.onclick = () => {
  stopTimer();
  score = 0;
  currentIndex = 0;
  selectedOptionIndex = null;
  userAnswers = [];
  questions = [];

  resultBox.classList.add("hidden");
  reviewBox.classList.add("hidden");
  startBox.classList.remove("hidden");
};

// Exit logic
exitBtn.onclick = () => {
  stopTimer();
  score = 0;
  currentIndex = 0;
  selectedOptionIndex = null;
  userAnswers = [];
  questions = [];

  quizBox.classList.add("hidden");
  startBox.classList.remove("hidden");
};

// Start quiz logic
startBtn.addEventListener("click", () => {
  startBox.classList.add("hidden");
  quizBox.classList.remove("hidden");
  score = 0;
  currentIndex = 0;
  selectedOptionIndex = null;
  userAnswers = [];

  fetch("questions.json")
    .then((res) => res.json())
    .then((data) => {
      questions = shuffleArray(data).slice(0, 10);
      loadQuestion();
    })
    .catch((err) => {
      console.error("Failed to load questions.json:", err);
      alert("Could not load quiz data.");
    });
});

// Timer
function startTimer() {
  stopTimer();
  timeLeft = 30;

  const timerEl = document.getElementById("time-remaining");
  if (!timerEl) return;

  timerEl.textContent = timeLeft;

  timerInterval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      handleAutoNext();
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// If time runs out
function handleAutoNext() {
  userAnswers.push(null); // No answer selected

  currentIndex++;
  selectedOptionIndex = null;

  if (currentIndex < questions.length) {
    loadQuestion();
  } else {
    showResult();
  }
}

// ✅ REVIEW LOGIC
reviewBtn.onclick = () => {
  resultBox.classList.add("hidden");
  reviewBox.classList.remove("hidden");
  renderReview();
};

backBtn.onclick = () => {
  reviewBox.classList.add("hidden");
  resultBox.classList.remove("hidden");
};

// ✅ Build Review List
function renderReview() {
  reviewContainer.innerHTML = "";

  const labels = ["A", "B", "C", "D"];

  questions.forEach((q, index) => {
    const userAnswer = userAnswers[index];
    const correctIndex = q.answer;

    const reviewItem = document.createElement("div");
    reviewItem.className = "review-item";

    const questionEl = document.createElement("h4");
    questionEl.textContent = `Q${index + 1}: ${q.question}`;
    reviewItem.appendChild(questionEl);

    const list = document.createElement("ul");

    q.options.forEach((opt, i) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${labels[i]}.</strong> ${opt}`;

      if (i === correctIndex) {
        li.classList.add("correct");
      }

      if (userAnswer === i && userAnswer !== correctIndex) {
        li.classList.add("wrong");
      }

      if (userAnswer === i && userAnswer === correctIndex) {
        li.classList.add("user-correct");
      }

      list.appendChild(li);
    });

    if (userAnswer === null) {
      const skipped = document.createElement("p");
      skipped.style.color = "#dc3545";
      skipped.style.fontWeight = "bold";
      skipped.textContent = "⏱ Skipped";
      reviewItem.appendChild(skipped);
    }

    reviewItem.appendChild(list);
    reviewContainer.appendChild(reviewItem);
  });
}
