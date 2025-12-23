const scenarios = [
    // Easy scenarios
    {
        title: "Ordering Coffee",
        category: "daily",
        difficulty: "easy",
        roleA: "You are a customer at a coffee shop. Order your favorite drink and ask about the price.",
        roleB: "You are a friendly barista. Greet the customer, take their order, and tell them the price.",
        hints: ["coffee", "please", "thank you", "how much", "latte", "cappuccino"]
    },
    {
        title: "Asking for Directions",
        category: "daily",
        difficulty: "easy",
        roleA: "You are lost in a new city. Ask someone how to get to the nearest subway station.",
        roleB: "You are a helpful local person. Give clear directions to the subway station.",
        hints: ["excuse me", "where is", "turn left", "turn right", "straight ahead", "thank you"]
    },
    {
        title: "Talking About Hobbies",
        category: "daily",
        difficulty: "easy",
        roleA: "Ask your friend about their hobbies and what they like to do in their free time.",
        roleB: "Tell your friend about your hobbies. Ask them about their hobbies too.",
        hints: ["hobby", "like", "enjoy", "free time", "interesting", "fun"]
    },
    {
        title: "At the Airport",
        category: "travel",
        difficulty: "easy",
        roleA: "You are checking in for your flight. Show your passport and ask about your gate number.",
        roleB: "You are an airport staff member. Check the passenger's ticket and tell them their gate number.",
        hints: ["passport", "ticket", "gate", "flight", "boarding", "luggage"]
    },
    // Medium scenarios
    {
        title: "Planning a Weekend Trip",
        category: "travel",
        difficulty: "medium",
        roleA: "You want to plan a weekend trip. Suggest a destination and explain why you want to go there.",
        roleB: "You have different ideas about where to go. Discuss your preferences and find a compromise.",
        hints: ["suggest", "prefer", "because", "maybe", "what about", "compromise", "agree"]
    },
    {
        title: "Discussing Movie Preferences",
        category: "daily",
        difficulty: "medium",
        roleA: "You love action movies. Explain why you prefer them and try to convince your partner to watch one.",
        roleB: "You prefer romantic comedies. Share your opinion and discuss which movie to watch together.",
        hints: ["prefer", "because", "opinion", "think", "suggest", "maybe", "compromise"]
    },
    {
        title: "Work Project Discussion",
        category: "work",
        difficulty: "medium",
        roleA: "You have a new project idea. Present it to your colleague and ask for their opinion.",
        roleB: "You have concerns about the project. Ask questions and suggest improvements.",
        hints: ["idea", "project", "opinion", "concern", "suggest", "improve", "discuss"]
    },
    {
        title: "Choosing a Restaurant",
        category: "romance",
        difficulty: "medium",
        roleA: "You want to try a new Italian restaurant. Explain why it sounds good and try to convince your partner.",
        roleB: "You prefer the usual place. Share your reasons and discuss both options together.",
        hints: ["suggest", "prefer", "because", "maybe", "try", "discuss", "decide"]
    },
    // Hard scenarios
    {
        title: "Convincing About a Big Change",
        category: "deep",
        difficulty: "hard",
        roleA: "You want to make a big life change (like moving cities or changing careers). Explain your reasons and try to convince your partner.",
        roleB: "You have concerns about this change. Ask questions, share your feelings, and discuss the future together.",
        hints: ["convince", "reason", "concern", "future", "feel", "discuss", "decision", "important"]
    },
    {
        title: "Giving Relationship Advice",
        category: "deep",
        difficulty: "hard",
        roleA: "Your friend is having relationship problems. Listen and give thoughtful advice about communication.",
        roleB: "You are having relationship problems. Share your feelings and ask for advice.",
        hints: ["advice", "problem", "feel", "suggest", "communication", "understand", "help", "support"]
    },
    {
        title: "Telling a Personal Story",
        category: "deep",
        difficulty: "hard",
        roleA: "Share a meaningful story from your past. Include details about what happened and how it affected you.",
        roleB: "Listen to the story. Ask questions to understand better and share your thoughts.",
        hints: ["story", "remember", "happen", "feel", "important", "understand", "share", "experience"]
    },
    {
        title: "Romantic Future Planning",
        category: "romance",
        difficulty: "hard",
        roleA: "You want to talk about your future together. Share your dreams and hopes for the relationship.",
        roleB: "Listen and share your own dreams. Discuss how you can build this future together.",
        hints: ["future", "dream", "hope", "together", "plan", "imagine", "believe", "commitment"]
    },
    {
        title: "Silly Superhero Team",
        category: "fun",
        difficulty: "hard",
        roleA: "You are a superhero with a funny power (like turning things into cheese). Convince others to join your team.",
        roleB: "You are another superhero with a silly power. Discuss your powers and plan a funny mission together.",
        hints: ["superhero", "power", "funny", "team", "mission", "convince", "imagine", "creative"]
    },
    {
        title: "Time Travel Adventure",
        category: "fun",
        difficulty: "hard",
        roleA: "You just discovered a time machine. Tell your friend about it and convince them to travel with you.",
        roleB: "You are skeptical but curious. Ask questions about time travel and discuss where you would go.",
        hints: ["time travel", "discover", "convince", "skeptical", "curious", "where", "when", "adventure"]
    }
];

let selectedDifficulty = "easy";
let selectedCategory = "daily";
let currentScenario = null;
let timerInterval = null;
let timeRemaining = 0;
let totalTime = 150; // 2 minutes 30 seconds in seconds
let rolesSwapped = false;

// Initialize difficulty buttons
document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        selectedDifficulty = this.dataset.difficulty;
    });
});

// Initialize category buttons
document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        selectedCategory = this.dataset.category;
    });
});

// Swap roles functionality
document.getElementById('swapBtn').addEventListener('click', function() {
    if (!currentScenario) return;
    
    rolesSwapped = !rolesSwapped;
    
    const roleASection = document.getElementById('roleASection');
    const roleBSection = document.getElementById('roleBSection');
    const roleA = document.getElementById('roleA');
    const roleB = document.getElementById('roleB');
    
    if (rolesSwapped) {
        // Swap the content
        const tempText = roleA.textContent;
        roleA.textContent = roleB.textContent;
        roleB.textContent = tempText;
        
        // Visual feedback
        roleASection.classList.add('swapped');
        roleBSection.classList.remove('swapped');
    } else {
        // Restore original
        roleA.textContent = currentScenario.roleA;
        roleB.textContent = currentScenario.roleB;
        
        roleASection.classList.remove('swapped');
        roleBSection.classList.remove('swapped');
    }
});

// Timer functionality
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function updateTimerDisplay() {
    const timerText = document.getElementById('timerText');
    const timerProgress = document.getElementById('timerProgress');
    const circumference = 2 * Math.PI * 45; // radius is 45
    
    timerText.textContent = formatTime(timeRemaining);
    
    const progress = (totalTime - timeRemaining) / totalTime;
    const offset = circumference - (progress * circumference);
    timerProgress.style.strokeDashoffset = offset;
    
    // Change color when less than 30 seconds remain
    if (timeRemaining <= 30) {
        timerProgress.classList.add('warning');
    } else {
        timerProgress.classList.remove('warning');
    }
}

function startTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    timeRemaining = totalTime;
    updateTimerDisplay();
    
    const timerSection = document.getElementById('timerSection');
    const startBtn = document.getElementById('startTimerBtn');
    const stopBtn = document.getElementById('stopTimerBtn');
    const timerComplete = document.getElementById('timerComplete');
    
    timerSection.style.display = 'block';
    startBtn.style.display = 'none';
    stopBtn.style.display = 'block';
    
    if (timerComplete) {
        timerComplete.remove();
    }
    
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        
        if (timeRemaining <= 0) {
            stopTimer();
            showTimerComplete();
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    const startBtn = document.getElementById('startTimerBtn');
    const stopBtn = document.getElementById('stopTimerBtn');
    
    startBtn.style.display = 'block';
    stopBtn.style.display = 'none';
}

function showTimerComplete() {
    const timerSection = document.getElementById('timerSection');
    const completeDiv = document.createElement('div');
    completeDiv.className = 'timer-complete';
    completeDiv.id = 'timerComplete';
    completeDiv.textContent = '⏰ Time\'s up! How did it go? 😊';
    timerSection.appendChild(completeDiv);
    
    // Vibrate if supported
    if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
    }
}

document.getElementById('startTimerBtn').addEventListener('click', startTimer);
document.getElementById('stopTimerBtn').addEventListener('click', stopTimer);

// Spin button functionality
document.getElementById('spinBtn').addEventListener('click', function() {
    // Stop any running timer
    stopTimer();
    rolesSwapped = false;
    
    // Reset role sections
    document.getElementById('roleASection').classList.remove('swapped');
    document.getElementById('roleBSection').classList.remove('swapped');
    
    // Filter scenarios by difficulty and category
    let filteredScenarios = scenarios.filter(scenario => {
        const difficultyMatch = scenario.difficulty === selectedDifficulty;
        const categoryMatch = selectedCategory === "all" || scenario.category === selectedCategory;
        return difficultyMatch && categoryMatch;
    });

    // Hide previous scenario
    document.getElementById('scenarioCard').classList.remove('show');
    document.getElementById('noScenarioCard').style.display = 'none';
    document.getElementById('timerSection').style.display = 'none';

    // Check if we have matching scenarios
    if (filteredScenarios.length === 0) {
        document.getElementById('noScenarioCard').style.display = 'block';
        currentScenario = null;
        return;
    }

    // Select random scenario
    currentScenario = filteredScenarios[Math.floor(Math.random() * filteredScenarios.length)];

    // Display scenario
    document.getElementById('scenarioTitle').textContent = currentScenario.title;
    document.getElementById('roleA').textContent = currentScenario.roleA;
    document.getElementById('roleB').textContent = currentScenario.roleB;

    // Display hints
    const hintsList = document.getElementById('hintsList');
    hintsList.innerHTML = '';
    currentScenario.hints.forEach(hint => {
        const hintTag = document.createElement('span');
        hintTag.className = 'hint-tag';
        hintTag.textContent = hint;
        hintsList.appendChild(hintTag);
    });

    // Show scenario card with animation
    setTimeout(() => {
        document.getElementById('scenarioCard').classList.add('show');
    }, 50);
});
