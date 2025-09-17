
document.addEventListener('DOMContentLoaded', () => {

    // --- Sound Engine using Tone.js ---
    const synth = new Tone.Synth({
        oscillator: { type: 'square' },
        envelope: {
            attack: 0.005,
            decay: 0.1,
            sustain: 0.3,
            release: 0.2,
        },
    }).toDestination();

    function playSound(note, duration) {
        if (Tone.context.state !== 'running') {
            Tone.context.resume();
        }
        synth.triggerAttackRelease(note, duration);
    }

    // Click sound for all interactive elements
    document.querySelectorAll('a, button').forEach(element => {
        element.addEventListener('click', () => playSound('C4', '8n'));
    });

    // Hover sound for game cards
    document.querySelectorAll('.game-card, .nav-links a').forEach(card => {
        card.addEventListener('mouseenter', () => {
            playSound('C5', '16n');
        });
    });

    // --- Terminal Typing Effect ---
    const terminalOutput = document.getElementById('terminal-output');

    let currentLine = 0;
    let currentChar = 0;
    let terminalHasTyped = false;

    function typeLine() {
        if (currentLine < lines.length) {
            const line = lines[currentLine];
            if (currentChar < line.length) {
                if (terminalOutput.innerHTML.endsWith('<span class="cursor">█</span>')) {
                    terminalOutput.innerHTML = terminalOutput.innerHTML.slice(0, -28);
                }
                terminalOutput.innerHTML += line[currentChar];
                terminalOutput.innerHTML += '<span class="cursor">█</span>';
                currentChar++;
                setTimeout(typeLine, 20); // Typing speed
            } else {
                currentChar = 0;
                currentLine++;
                if (terminalOutput.innerHTML.endsWith('<span class="cursor">█</span>')) {
                    terminalOutput.innerHTML = terminalOutput.innerHTML.slice(0, -28);
                }
                terminalOutput.innerHTML += '<br>';
                setTimeout(typeLine, 300); // Pause between lines
            }
        }
    }

    const terminalObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !terminalHasTyped) {
            typeLine();
            terminalHasTyped = true; // Ensure it only types once
            terminalObserver.disconnect();
        }
    }, { threshold: 0.1 });

    if (terminalOutput) {
        terminalObserver.observe(terminalOutput);
    }

    // --- Konami Code Easter Egg ---
    const konamiModal = document.getElementById('konami-modal');
    const closeKonamiBtn = document.getElementById('close-konami');
    let konamiCode = [];
    const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

    document.addEventListener('keydown', (e) => {
        konamiCode.push(e.key);
        konamiCode.splice(-konamiSequence.length - 1, konamiCode.length - konamiSequence.length);

        if (konamiCode.join('').toLowerCase() === konamiSequence.join('')) {
            playSound('C5', '8n');
            setTimeout(() => playSound('E5', '8n'), 150);
            setTimeout(() => playSound('G5', '4n'), 300);

            konamiModal.style.display = 'flex';
            konamiCode = []; // Reset code
        }
    });

    closeKonamiBtn.addEventListener('click', () => {
        konamiModal.style.display = 'none';
    });

    // --- Active Nav Link on Scroll ---
    const sections = document.querySelectorAll('.game-section');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = 'home'; // Default to home
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= sectionTop - 60) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            const linkHref = link.getAttribute('href');
            if (linkHref && linkHref.includes(current)) {
                link.classList.add('active');
            }
        });
    });

    // --- Countdown Timer ---
    const countDownDate = new Date("Jan 5, 2026 00:00:00").getTime();
    const countdownFunction = setInterval(function () {
        const now = new Date().getTime();
        const distance = countDownDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById("days").innerText = String(days).padStart(2, '0');
        document.getElementById("hours").innerText = String(hours).padStart(2, '0');
        document.getElementById("minutes").innerText = String(minutes).padStart(2, '0');
        document.getElementById("seconds").innerText = String(seconds).padStart(2, '0');

        if (distance < 0) {
            clearInterval(countdownFunction);
            document.getElementById("countdown").innerHTML = "<div class='glitch' data-text='EVENT IS LIVE!'>EVENT IS LIVE!</div>";
        }
    }, 1000);

    // --- Registered Users Counter ---
    let userCount = 1337;
    const userCountElement = document.getElementById("registered-users");
    setInterval(function () {
        userCount += Math.floor(Math.random() * 3) + 1;
        userCountElement.innerText = userCount;
    }, 2500); // Update every 2.5 seconds

});
// --- Event Modal ---
const closeEventBtn = document.getElementById('close-event');
const eventModal = document.getElementById('event-modal');
const eventTitle = document.getElementById('event-title');
const eventDescription = document.getElementById('event-description');
const eventDate = document.getElementById('event-date');
const eventRules= document.getElementById('event-rules');
const eventRulesDesc = document.getElementById('event-rules-desc');
const eventMatch = document.getElementById('event-match');
const eventMatchDesc = document.getElementById('event-match-desc');
const eventPrize = document.getElementById('event-prize');
const eventPrizeDesc = document.getElementById('event-prize-desc');
const eventRegFees = document.getElementById('event-reg-fees')
// Attach event listeners to buttons
// Attach event listeners to buttons
document.querySelectorAll('.game-card').forEach(card => {
    const title = card.querySelector('h3').innerText;
    const description = card.querySelector('#main-p').innerText;
    const date = card.querySelector('#main-date').innerText;
    const mainRules1 = card.querySelector('#main-rules1').innerText;
    const mainRulesData1= card.querySelector('#main-rules-data1').innerHTML; // <-- changed
    const mainRules2 = card.querySelector('#main-rules2').innerText;
    const mainRulesData2 = card.querySelector('#main-rules-data2').innerHTML; // <-- changed
    const mainRules3 = card.querySelector('#main-rules3').innerText;
    const mainRulesData3 = card.querySelector('#main-rules-data3').innerHTML; // <-- changed
    const mainRules4 = card.querySelector('#main-rules-data4').innerHTML;
    // PREVIEW button
    card.querySelector('.pixel-button-preview').addEventListener('click', (e) => {
        e.preventDefault();
        eventTitle.innerText = title+" - "+description;
        eventDate.innerText = date;
        eventRules.innerText = mainRules1;
        eventRulesDesc.innerHTML = mainRulesData1; // <-- changed
        eventMatch.innerText = mainRules2;
        eventMatchDesc.innerHTML = mainRulesData2; // <-- changed
        eventPrize.innerText = mainRules3;
        eventPrizeDesc.innerHTML = mainRulesData3; // <-- changed
        eventRegFees.innerHTML=mainRules4;
        eventModal.style.display = 'flex';
        document.body.style.overflow="hidden";
    });

    // ENTER button (show details + redirect or just details)
    card.querySelector('.pixel-button').addEventListener('click', (e) => {
        e.preventDefault();
        eventTitle.innerText = "Register: " + title;
        eventDescription.innerText = "You are about to enter " + title + ".\n\n" + description;
        eventModal.style.display = 'flex';
        // Optionally redirect after confirmation
    });
});
function closeEventBtnHere() {
    document.body.style.overflow="auto";
    eventModal.style.display = 'none';
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === eventModal) {
        eventModal.style.display = 'none';
    }
});
