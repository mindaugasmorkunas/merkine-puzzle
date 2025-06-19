// Puzzle answers (case-insensitive)
const answers = {
    1: ['dzukija national park', 'dzukija', 'dzūkija national park', 'dzūkija'],
    2: ['nemunas', 'nemunas river'],
    3: [9, 8, 10, 7, 11], // Acceptable range for trail length
    4: ['north'],
    5: [8, 7, 9, 6, 10] // Acceptable range for landmarks count
};

let solvedQuestions = new Set();
let totalQuestions = 5;

// SessionStorage keys
const STORAGE_KEY = 'merkine-puzzle-progress';

// Save progress to sessionStorage
function saveProgress() {
    const progressData = {
        solvedQuestions: Array.from(solvedQuestions),
        answers: {},
        timestamp: Date.now()
    };
    
    // Save the actual answers for each solved question
    solvedQuestions.forEach(questionNum => {
        const inputElement = document.getElementById(`answer${questionNum}`);
        if (inputElement) {
            progressData.answers[questionNum] = inputElement.value;
        }
    });
    
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
}

// Load progress from sessionStorage
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

// Restore puzzle state from saved progress
function restorePuzzleState(progressData) {
    if (solvedQuestions.size === 0) return;
    
    // Restore each solved question
    solvedQuestions.forEach(questionNum => {
        const questionCard = document.querySelector(`[data-question="${questionNum}"]`);
        const inputElement = document.getElementById(`answer${questionNum}`);
        const feedbackElement = document.getElementById(`feedback${questionNum}`);
        
        if (questionCard && inputElement && feedbackElement) {
            // Restore the saved answer
            if (progressData.answers && progressData.answers[questionNum] !== undefined) {
                inputElement.value = progressData.answers[questionNum];
            }
            
            // Mark as solved
            questionCard.classList.add('solved');
            inputElement.disabled = true;
            inputElement.nextElementSibling.disabled = true;
            
            // Show success feedback
            feedbackElement.textContent = '✅ Correct! Puzzle piece revealed!';
            feedbackElement.className = 'feedback correct show';
            
            // Reveal puzzle piece
            revealPuzzlePiece(questionNum);
        }
    });
    
    // Update progress
    updateProgress();
    
    // If all questions solved, reveal everything
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
        // Check if number input is empty or invalid
        if (isNaN(userAnswer)) {
            feedbackElement.classList.add('show');
            feedbackElement.textContent = '⚠️ Please enter a valid number.';
            feedbackElement.className = 'feedback incorrect show';
            return;
        }
    } else if (inputElement.tagName === 'SELECT') {
        userAnswer = inputElement.value.toLowerCase().trim();
        // Check if select input is empty
        if (userAnswer === '') {
            feedbackElement.classList.add('show');
            feedbackElement.textContent = '⚠️ Please select an option.';
            feedbackElement.className = 'feedback incorrect show';
            return;
        }
    } else {
        userAnswer = inputElement.value.toLowerCase().trim();
        // Check if text input is empty
        if (userAnswer === '') {
            feedbackElement.classList.add('show');
            feedbackElement.textContent = '⚠️ Please enter an answer before submitting.';
            feedbackElement.className = 'feedback incorrect show';
            return;
        }
    }
    
    let isCorrect = false;
    
    // Check if answer is correct
    if (Array.isArray(answers[questionNum])) {
        if (typeof answers[questionNum][0] === 'number') {
            isCorrect = answers[questionNum].includes(userAnswer);
        } else {
            isCorrect = answers[questionNum].some(answer => 
                userAnswer.includes(answer) || answer.includes(userAnswer)
            );
        }
    } else {
        isCorrect = userAnswer === answers[questionNum];
    }
    
    // Show feedback
    feedbackElement.classList.add('show');
    
    if (isCorrect) {
        feedbackElement.textContent = '✅ Correct! Puzzle piece revealed!';
        feedbackElement.className = 'feedback correct show';
        questionCard.classList.add('solved');
        inputElement.disabled = true;
        inputElement.nextElementSibling.disabled = true;
        
        solvedQuestions.add(questionNum);
        
        // Save progress to sessionStorage
        saveProgress();
        
        // Reveal the corresponding puzzle piece
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
        
        // Give hints for specific questions
        if (questionNum === 1) {
            feedbackElement.textContent += ' Hint: Think about the national park that preserves Lithuanian nature and culture.';
        } else if (questionNum === 2) {
            feedbackElement.textContent += ' Hint: It\'s Lithuania\'s longest river.';
        } else if (questionNum === 3) {
            feedbackElement.textContent += ' Hint: A typical forest loop trail is around 8-10 km.';
        } else if (questionNum === 4) {
            feedbackElement.textContent += ' Hint: Think about following the river meanders from town.';
        } else if (questionNum === 5) {
            feedbackElement.textContent += ' Hint: Consider historic sites, viewpoints, and natural landmarks along a 9km trail.';
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
        
        // Add animation effect
        piece.style.transform = 'scale(1.1)';
        setTimeout(() => {
            piece.style.transform = 'scale(1)';
        }, 300);
        
        // Update piece status
        const overlay = piece.querySelector('.piece-overlay');
        const status = overlay.querySelector('.piece-status');
        status.textContent = '✅ Unlocked!';
        status.style.color = '#2ecc71';
        
        // Add sparkle effect
        createSparkles(piece);
    }
}

function revealCenterPiece() {
    const centerPiece = document.getElementById('pieceCenter');
    if (centerPiece) {
        centerPiece.classList.add('revealed');
        
        // Add dramatic animation
        centerPiece.style.transform = 'scale(1.2)';
        setTimeout(() => {
            centerPiece.style.transform = 'scale(1)';
        }, 500);
        
        // Update status
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
    
    // Scroll to reveal
    trailReveal.scrollIntoView({ behavior: 'smooth' });
    
    // Add celebration effect
    createConfetti();
}

function resetPuzzle() {
    solvedQuestions.clear();
    
    // Clear sessionStorage
    sessionStorage.removeItem(STORAGE_KEY);
    
    // Reset all inputs and feedback
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
        
        // Reset puzzle pieces
        const piece = document.getElementById(`piece${i}`);
        if (piece) {
            piece.classList.remove('revealed');
            piece.style.transform = 'scale(1)';
            
            // Reset piece status
            const overlay = piece.querySelector('.piece-overlay');
            const status = overlay.querySelector('.piece-status');
            const clueTypes = ['Historic Clue', 'Nature Clue', 'Geography Clue', 'Navigation Clue', 'Trail Clue'];
            status.textContent = `🔒 Solve ${clueTypes[i-1]}`;
            status.style.color = 'white';
        }
    }
    
    // Reset center piece
    const centerPiece = document.getElementById('pieceCenter');
    if (centerPiece) {
        centerPiece.classList.remove('revealed');
        centerPiece.style.transform = 'scale(1)';
        
        const overlay = centerPiece.querySelector('.piece-overlay');
        const status = overlay.querySelector('.piece-status');
        status.textContent = '🏁 Complete All Clues';
        status.style.color = 'white';
    }
    
    // Reset progress
    updateProgress();
    
    // Hide trail reveal
    document.getElementById('trailReveal').classList.remove('show');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function createConfetti() {
    // Simple confetti effect
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

// Add Enter key support for inputs and initialize
document.addEventListener('DOMContentLoaded', function() {
    // Load saved progress
    const progressData = loadProgress();
    if (progressData) {
        console.log('Restored puzzle progress from session');
        restorePuzzleState(progressData);
    }
    
    // Add Enter key support
    for (let i = 1; i <= totalQuestions; i++) {
        const input = document.getElementById(`answer${i}`);
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkAnswer(i);
            }
        });
    }
});

// Initialize progress
updateProgress(); 