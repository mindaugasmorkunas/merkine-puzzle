const answers = {
    1: 'dzukija',
    2: 'nemunas', 
    3: ['7', '8', '9', '10', '11'],
    4: 'north',
    5: '4',
    6: 'wladyslaw'
};

let solvedQuestions = new Set();
let totalQuestions = 6;

const STORAGE_KEY = 'merkine-puzzle-progress';

function saveProgress() {
    const progressData = {
        solvedQuestions: Array.from(solvedQuestions),
        answers: {},
        timestamp: Date.now()
    };
    
    solvedQuestions.forEach(questionNum => {
        const inputElement = document.getElementById(`answer${questionNum}`);
        if (inputElement) {
            progressData.answers[questionNum] = inputElement.value;
        }
    });
    
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
}

function loadProgress() {
    try {
        const saved = sessionStorage.getItem(STORAGE_KEY);
        if (saved) {
            const progressData = JSON.parse(saved);
            if (progressData.solvedQuestions && Array.isArray(progressData.solvedQuestions)) {
                solvedQuestions = new Set(progressData.solvedQuestions);
                return progressData;
            }
        }
    } catch (error) {
        console.log('Error loading progress:', error);
    }
    return null;
}

function restorePuzzleState(progressData) {
    if (solvedQuestions.size === 0) return;
    
    solvedQuestions.forEach(questionNum => {
        const questionCard = document.querySelector(`[data-question="${questionNum}"]`);
        const inputElement = document.getElementById(`answer${questionNum}`);
        const feedbackElement = document.getElementById(`feedback${questionNum}`);
        
        if (questionCard && inputElement && feedbackElement) {
            if (progressData.answers && progressData.answers[questionNum] !== undefined) {
                inputElement.value = progressData.answers[questionNum];
            }
            
            questionCard.classList.add('solved');
            inputElement.disabled = true;
            inputElement.nextElementSibling.disabled = true;
            
            feedbackElement.textContent = '✅ Correct! Puzzle piece revealed!';
            feedbackElement.className = 'feedback correct show';
            
            revealPuzzlePiece(questionNum);
        }
    });
    
    updateProgress();
    
    if (solvedQuestions.size === totalQuestions) {
        setTimeout(() => {
            revealCenterPiece();
            showTrailReveal();
        }, 500);
    }
}

function checkAnswer(questionNum) {
    const inputElement = document.getElementById(`answer${questionNum}`);
    const feedbackElement = document.getElementById(`feedback${questionNum}`);
    const questionCard = document.querySelector(`[data-question="${questionNum}"]`);
    
    let userAnswer;
    if (inputElement.type === 'number') {
        userAnswer = parseInt(inputElement.value);
        if (isNaN(userAnswer)) {
            feedbackElement.classList.add('show');
            feedbackElement.textContent = '⚠️ Please enter a valid number.';
            feedbackElement.className = 'feedback incorrect show';
            return;
        }
    } else if (inputElement.tagName === 'SELECT') {
        userAnswer = inputElement.value.toLowerCase().trim();
        if (userAnswer === '') {
            feedbackElement.classList.add('show');
            feedbackElement.textContent = '⚠️ Please select an option.';
            feedbackElement.className = 'feedback incorrect show';
            return;
        }
    } else {
        userAnswer = inputElement.value.toLowerCase().trim();
        if (userAnswer === '') {
            feedbackElement.classList.add('show');
            feedbackElement.textContent = '⚠️ Please enter an answer before submitting.';
            feedbackElement.className = 'feedback incorrect show';
            return;
        }
    }
    
    let isCorrect = false;
    
    if (Array.isArray(answers[questionNum])) {
        isCorrect = answers[questionNum].includes(userAnswer);
    } else {
        isCorrect = userAnswer === answers[questionNum];
    }
    
    feedbackElement.classList.add('show');
    
    if (isCorrect) {
        feedbackElement.textContent = '✅ Correct! Puzzle piece revealed!';
        feedbackElement.className = 'feedback correct show';
        questionCard.classList.add('solved');
        inputElement.disabled = true;
        inputElement.nextElementSibling.disabled = true;
        
        solvedQuestions.add(questionNum);
        
        saveProgress();
        
        revealPuzzlePiece(questionNum);
        updateProgress();
        
        if (solvedQuestions.size === totalQuestions) {
            setTimeout(() => {
                revealCenterPiece();
                showTrailReveal();
            }, 1000);
        }
    } else {
        feedbackElement.textContent = '❌ Not quite right. Try again!';
        feedbackElement.className = 'feedback incorrect show';
        
        if (questionNum === 1) {
            feedbackElement.textContent += ' Hint: This park is famous for its pine forests and is located in southern Lithuania.';
        } else if (questionNum === 2) {
            feedbackElement.textContent += ' Hint: It\'s Lithuania\'s longest river.';
        } else if (questionNum === 3) {
            feedbackElement.textContent += ' Hint: A typical forest loop trail is around 8-10 km.';
        } else if (questionNum === 4) {
            feedbackElement.textContent += ' Hint: Think about following the river meanders from town.';
        } else if (questionNum === 5) {
            feedbackElement.textContent += ' Hint: Think about a comfortable pace for 9km with photo stops and rest breaks.';
        } else if (questionNum === 6) {
            feedbackElement.textContent += ' Hint: This king was from the Vasa dynasty and ruled in the 17th century.';
        }
    }
}

function updateProgress() {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    const progressPercentage = (solvedQuestions.size / totalQuestions) * 100;
    progressFill.style.width = progressPercentage + '%';
    progressText.textContent = `Progress: ${solvedQuestions.size}/${totalQuestions} clues solved`;
}

function revealPuzzlePiece(pieceNum) {
    const piece = document.getElementById(`piece${pieceNum}`);
    if (piece) {
        piece.classList.add('revealed');
        
        piece.style.transform = 'scale(1.1)';
        setTimeout(() => {
            piece.style.transform = 'scale(1)';
        }, 300);
        
        const overlay = piece.querySelector('.piece-overlay');
        const status = overlay.querySelector('.piece-status');
        status.textContent = '✅ Unlocked!';
        status.style.color = '#2ecc71';
        
        createSparkles(piece);
    }
}

function revealCenterPiece() {
    const centerPiece = document.getElementById('pieceCenter');
    if (centerPiece) {
        centerPiece.classList.add('revealed');
        
        centerPiece.style.transform = 'scale(1.2)';
        setTimeout(() => {
            centerPiece.style.transform = 'scale(1)';
        }, 500);
        
        const overlay = centerPiece.querySelector('.piece-overlay');
        const status = overlay.querySelector('.piece-status');
        status.textContent = '🎉 Trail Revealed!';
        status.style.color = '#e74c3c';
    }
}

function createSparkles(element) {
    const rect = element.getBoundingClientRect();
    const colors = ['#2ecc71', '#3498db', '#e74c3c', '#f39c12', '#9b59b6'];
    
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.style.position = 'fixed';
            sparkle.style.left = rect.left + Math.random() * rect.width + 'px';
            sparkle.style.top = rect.top + Math.random() * rect.height + 'px';
            sparkle.style.width = '6px';
            sparkle.style.height = '6px';
            sparkle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            sparkle.style.borderRadius = '50%';
            sparkle.style.pointerEvents = 'none';
            sparkle.style.zIndex = '9999';
            
            document.body.appendChild(sparkle);
            
            const animation = sparkle.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { transform: `translate(${(Math.random() - 0.5) * 100}px, ${(Math.random() - 0.5) * 100}px) scale(0)`, opacity: 0 }
            ], {
                duration: 1000,
                easing: 'ease-out'
            });
            
            animation.onfinish = () => sparkle.remove();
        }, i * 100);
    }
}

function showTrailReveal() {
    const trailReveal = document.getElementById('trailReveal');
    trailReveal.classList.add('show');
    
    trailReveal.scrollIntoView({ behavior: 'smooth' });
    
    createConfetti();
}

function resetPuzzle() {
    solvedQuestions.clear();
    
    sessionStorage.removeItem(STORAGE_KEY);
    
    for (let i = 1; i <= totalQuestions; i++) {
        const input = document.getElementById(`answer${i}`);
        const feedback = document.getElementById(`feedback${i}`);
        const card = document.querySelector(`[data-question="${i}"]`);
        const button = card.querySelector('button');
        
        input.value = '';
        input.disabled = false;
        button.disabled = false;
        feedback.classList.remove('show');
        card.classList.remove('solved');
        
        const piece = document.getElementById(`piece${i}`);
        if (piece) {
            piece.classList.remove('revealed');
            piece.style.transform = 'scale(1)';
            
            const overlay = piece.querySelector('.piece-overlay');
            const status = overlay.querySelector('.piece-status');
            const clueTypes = ['Historic Clue', 'Nature Clue', 'Geography Clue', 'Navigation Clue', 'Trail Clue', 'Royal Clue'];
            status.textContent = `🔒 Solve ${clueTypes[i-1]}`;
            status.style.color = 'white';
        }
    }
    
    const centerPiece = document.getElementById('pieceCenter');
    if (centerPiece) {
        centerPiece.classList.remove('revealed');
        centerPiece.style.transform = 'scale(1)';
        
        const overlay = centerPiece.querySelector('.piece-overlay');
        const status = overlay.querySelector('.piece-status');
        status.textContent = '🏁 Complete All Clues';
        status.style.color = 'white';
    }
    
    updateProgress();
    
    document.getElementById('trailReveal').classList.remove('show');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function createConfetti() {
    const colors = ['#2ecc71', '#3498db', '#e74c3c', '#f39c12', '#9b59b6'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.top = '-10px';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.pointerEvents = 'none';
            confetti.style.zIndex = '9999';
            confetti.style.borderRadius = '50%';
            
            document.body.appendChild(confetti);
            
            const animation = confetti.animate([
                { transform: 'translateY(-10px) rotate(0deg)', opacity: 1 },
                { transform: `translateY(100vh) rotate(720deg)`, opacity: 0 }
            ], {
                duration: 3000,
                easing: 'ease-out'
            });
            
            animation.onfinish = () => confetti.remove();
        }, i * 100);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const progressData = loadProgress();
    if (progressData) {
        console.log('Restored puzzle progress from session');
        restorePuzzleState(progressData);
    }
    
    for (let i = 1; i <= totalQuestions; i++) {
        const input = document.getElementById(`answer${i}`);
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkAnswer(i);
            }
        });
    }
});

updateProgress(); 