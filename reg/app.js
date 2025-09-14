// Application data
const appData = {
  competitions: [
    {
      id: "coding",
      name: "Coding Competition",
      type: "team",
      description: "Two-phase coding competition: reverse engineer outputs, debug faulty code",
      price: 150,
      currency: "INR",
      maxTeamSize: 3
    },
    {
      id: "typing",
      name: "Speed Typing",
      type: "individual",
      description: "Test your typing speed and accuracy",
      price: 50,
      currency: "INR"
    },
    {
      id: "quiz",
      name: "Written Quiz",
      type: "individual", 
      description: "Test your knowledge on paper, answer accurately",
      price: 75,
      currency: "INR"
    },
    {
      id: "logo",
      name: "Logo Design",
      type: "individual",
      description: "Show creativity by designing unique app logos",
      price: 100,
      currency: "INR"
    },
    {
      id: "webdesign",
      name: "Web Design",
      type: "individual",
      description: "Create stunning, responsive websites using HTML, CSS",
      price: 125,
      currency: "INR"
    },
    {
      id: "techexpo",
      name: "Tech Expo",
      type: "team",
      description: "Showcase innovations and tech creations",
      price: 200,
      currency: "INR",
      maxTeamSize: 4
    }
  ],
  tshirtSizes: ["XS", "S", "M", "L", "XL", "XXL"],
  dietaryPreferences: ["Vegetarian", "Non-Vegetarian", "Vegan", "Jain", "No Preference"]
};

// Sound System
class SoundSystem {
  constructor() {
    this.enabled = true;
    this.volume = 0.3;
    this.audioContext = null;
    this.sounds = {
      click: { frequency: 800, duration: 100 },
      hover: { frequency: 600, duration: 50 },
      success: { frequency: [440, 554, 659], duration: 300 },
      error: { frequency: 200, duration: 200 },
      navigation: { frequency: 700, duration: 150 },
      focus: { frequency: 500, duration: 75 },
      select: { frequency: 900, duration: 120 }
    };
    this.initializeAudioContext();
  }

  initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
      this.enabled = false;
    }
  }

  async ensureAudioContext() {
    if (!this.audioContext || !this.enabled) return false;
    
    if (this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (error) {
        console.warn('Could not resume audio context:', error);
        return false;
      }
    }
    return true;
  }

  async playSound(soundType) {
    if (!await this.ensureAudioContext()) return;

    const soundConfig = this.sounds[soundType];
    if (!soundConfig) return;

    try {
      if (Array.isArray(soundConfig.frequency)) {
        // Play sequence of tones (for success sound)
        this.playToneSequence(soundConfig.frequency, soundConfig.duration);
      } else {
        // Play single tone
        this.playTone(soundConfig.frequency, soundConfig.duration);
      }
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  }

  playTone(frequency, duration) {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = 'square'; // Classic 8-bit square wave
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration / 1000);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration / 1000);
  }

  playToneSequence(frequencies, totalDuration) {
    const toneDuration = totalDuration / frequencies.length;
    frequencies.forEach((frequency, index) => {
      setTimeout(() => {
        this.playTone(frequency, toneDuration);
      }, index * toneDuration);
    });
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }
}

// Global variables
let currentStep = 1;
let totalSteps = 5;
let selectedCompetitions = [];
let formData = {};
let soundSystem = new SoundSystem();

// DOM elements
const form = document.getElementById('registrationForm');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const successModal = document.getElementById('successModal');
const soundToggle = document.getElementById('soundToggle');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  initializeForm();
  setupEventListeners();
  setupSoundEvents();
  updateStep();
  
  // Initialize audio context on first user interaction
  document.addEventListener('click', initializeAudio, { once: true });
  document.addEventListener('keydown', initializeAudio, { once: true });
});

function initializeAudio() {
  soundSystem.ensureAudioContext();
}

function initializeForm() {
  // Populate competitions
  populateCompetitions();
  
  
}

function populateCompetitions() {
  const grid = document.getElementById('competitionsGrid');
  grid.innerHTML = '';
  
  appData.competitions.forEach(competition => {
    const card = document.createElement('div');
    card.className = 'competition-card';
    card.setAttribute('data-competition', competition.id);
    
    card.innerHTML = `
      <input type="checkbox" class="competition-checkbox" id="comp-${competition.id}" value="${competition.id}">
      <div class="competition-name">${competition.name}</div>
      <div class="competition-type">${competition.type.toUpperCase()}${competition.maxTeamSize ? ` (Max ${competition.maxTeamSize} members)` : ''}</div>
      <div class="competition-description">${competition.description}</div>
      <div style="font-size: 8px; color: var(--pixel-yellow); margin-top: 8px;">₹${competition.price}</div>
    `;
    
    // Add click event to the card
    card.addEventListener('click', (e) => {
      if (e.target.type !== 'checkbox') {
        const checkbox = card.querySelector('.competition-checkbox');
        checkbox.checked = !checkbox.checked;
        toggleCompetitionSelection(competition.id, checkbox.checked);
        soundSystem.playSound('select');
      }
    });
    
    // Add change event to the checkbox
    const checkbox = card.querySelector('.competition-checkbox');
    checkbox.addEventListener('change', (e) => {
      e.stopPropagation();
      toggleCompetitionSelection(competition.id, e.target.checked);
      soundSystem.playSound('select');
    });
    
    // Add hover sound to card
    card.addEventListener('mouseenter', () => {
      soundSystem.playSound('hover');
    });
    
    grid.appendChild(card);
  });
}

function toggleCompetitionSelection(competitionId, isSelected) {
  const card = document.querySelector(`[data-competition="${competitionId}"]`);
  
  if (isSelected) {
    card.classList.add('selected');
    if (!selectedCompetitions.includes(competitionId)) {
      selectedCompetitions.push(competitionId);
    }
  } else {
    card.classList.remove('selected');
    selectedCompetitions = selectedCompetitions.filter(id => id !== competitionId);
  }
  

}


function setupEventListeners() {
  // Navigation buttons
  prevBtn.addEventListener('click', (e) => {
    e.preventDefault();
    prevStep();
  });
  
  nextBtn.addEventListener('click', (e) => {
    e.preventDefault();
    nextStep();
  });
  
  // Form submission
  form.addEventListener('submit', handleSubmit);
  
  // Sound toggle
  soundToggle.addEventListener('click', toggleSound);
  
  // Setup input validation and sound events
  setupInputSoundEvents();
}

function setupInputSoundEvents() {
  // Input validation and sound events
  const inputs = document.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    // Remove existing listeners to avoid duplicates
    input.removeEventListener('blur', validateInput);
    input.removeEventListener('input', clearError);
    input.removeEventListener('focus', handleInputFocus);
    
    // Add listeners
    input.addEventListener('blur', validateInput);
    input.addEventListener('input', clearError);
    input.addEventListener('focus', handleInputFocus);
  });
}

function handleInputFocus() {
  soundSystem.playSound('focus');
}

function setupSoundEvents() {
  // Button sound effects
  document.addEventListener('click', (e) => {
    if (e.target.matches('button, .btn')) {
      soundSystem.playSound('click');
    }
  });

  // Button hover sounds
  document.addEventListener('mouseenter', (e) => {
    if (e.target.matches('button, .btn, .nav-link')) {
      soundSystem.playSound('hover');
    }
  }, true);

  // Progress step hover sounds (but not clickable)
  document.querySelectorAll('.progress-step').forEach(step => {
    step.addEventListener('mouseenter', () => soundSystem.playSound('hover'));
  });
}

function toggleSound() {
  const isEnabled = soundSystem.toggle();
  const soundIcon = soundToggle.querySelector('.sound-icon');
  
  if (isEnabled) {
    soundIcon.textContent = '🔊';
    soundToggle.classList.remove('muted');
    soundSystem.playSound('click');
  } else {
    soundIcon.textContent = '🔇';
    soundToggle.classList.add('muted');
  }
}

function nextStep() {
  console.log('Next step clicked, current step:', currentStep);
  
  if (validateCurrentStep()) {
    if (currentStep === 2 && selectedCompetitions.length === 0) {
      showError('Please select at least one competition.');
      soundSystem.playSound('error');
      return;
    }
    console.log('Moving to step:', currentStep);
    soundSystem.playSound('navigation');
    updateStep();
  } else {
    console.log('Validation failed');
    soundSystem.playSound('error');
  }
}

function prevStep() {
  // Skip step 3 if no team competitions
  if (currentStep === 4 && !hasTeamCompetitions()) {
    currentStep -= 2;
  } else {
    currentStep--;
  }
  
  soundSystem.playSound('navigation');
  updateStep();
}

function updateStep() {
  console.log('Updating to step:', currentStep);
  
  // Update progress bar
  document.querySelectorAll('.progress-step').forEach((step, index) => {
    const stepNum = index + 1;
    step.classList.remove('active', 'completed');
    
    if (stepNum < currentStep) {
      step.classList.add('completed');
    } else if (stepNum === currentStep) {
      step.classList.add('active');
    }
  });
  
  // Update form steps
  document.querySelectorAll('.form-step').forEach((step, index) => {
    step.classList.remove('active');
    if (index + 1 === currentStep) {
      step.classList.add('active');
    }
  });
  
  // Update navigation buttons
  prevBtn.style.display = currentStep === 1 ? 'none' : 'inline-flex';
  
  if (currentStep === totalSteps) {
    nextBtn.classList.add('hidden');
    submitBtn.classList.remove('hidden');
    populateReviewSection();
  } else {
    nextBtn.classList.remove('hidden');
    submitBtn.classList.add('hidden');
  }
  
  // Update team member input sound events after step change
  if (currentStep === 3) {
    setupInputSoundEvents();
  }
}

function validateCurrentStep() {
  const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
  if (!currentStepElement) {
    console.log('Current step element not found for step:', currentStep);
    return false;
  }
  
  const requiredInputs = currentStepElement.querySelectorAll('input[required], select[required]');
  let isValid = true;
  
  console.log('Validating', requiredInputs.length, 'required inputs');
  
  requiredInputs.forEach(input => {
    if (!validateInput({ target: input })) {
      isValid = false;
    }
  });
  
  console.log('Validation result:', isValid);
  return isValid;
}

function validateInput(e) {
  const input = e.target;
  const errorElement = input.parentNode.querySelector('.error-message');
  let isValid = true;
  let errorMessage = '';
  
  // Clear previous error
  if (errorElement) {
    errorElement.textContent = '';
  }
  input.classList.remove('error');
  
  // Required field validation
  if (input.hasAttribute('required') && !input.value.trim()) {
    errorMessage = 'This field is required.';
    isValid = false;
  }
  
  // Email validation
  if (input.type === 'email' && input.value.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.value.trim())) {
      errorMessage = 'Please enter a valid email address.';
      isValid = false;
    }
  }
  
  // Phone validation
  if (input.type === 'tel' && input.value.trim()) {
    const phoneValue = input.value.trim().replace(/[\s\-\(\)]/g, '');
    if (phoneValue.length < 10 || !/^\+?[\d]+$/.test(phoneValue)) {
      errorMessage = 'Please enter a valid phone number (at least 10 digits).';
      isValid = false;
    }
  }
  
  // Show error if invalid
  if (!isValid && errorElement) {
    errorElement.textContent = errorMessage;
    input.classList.add('error');
  }
  
  return isValid;
}

function clearError(e) {
  const input = e.target;
  const errorElement = input.parentNode.querySelector('.error-message');
  if (errorElement) {
    errorElement.textContent = '';
  }
  input.classList.remove('error');
}

function showError(message) {
  // Create temporary error display
  const errorDiv = document.createElement('div');
  errorDiv.className = 'global-error';
  errorDiv.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: var(--pixel-red);
    color: var(--dark-bg);
    padding: 12px 20px;
    font-family: var(--font-family-pixel);
    font-size: 10px;
    z-index: 1001;
    animation: slideIn 0.3s ease;
    border: 2px solid var(--dark-bg);
  `;
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);
  
  setTimeout(() => {
    errorDiv.remove();
  }, 3000);
}

function collectFormData() {
  const data = {
    personal: {
      fullName: document.getElementById('fullName').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      institution: document.getElementById('institution').value
    },
    competitions: selectedCompetitions,
  };
  
  // Calculate total price
  data.totalPrice = selectedCompetitions.reduce((total, compId) => {
    const comp = appData.competitions.find(c => c.id === compId);
    return total + (comp ? comp.price : 0);
  }, 0);
  return data;
}

function populateReviewSection() {
  const reviewSection = document.getElementById('reviewSection');
  const data = collectFormData();
  
  let html = `
    <div class="review-category">
      <h4>Personal Information</h4>
      <div class="review-item">
        <span class="review-label">Full Name:</span>
        <span class="review-value">${data.personal.fullName}</span>
      </div>
      <div class="review-item">
        <span class="review-label">Email:</span>
        <span class="review-value">${data.personal.email}</span>
      </div>
      <div class="review-item">
        <span class="review-label">Phone:</span>
        <span class="review-value">${data.personal.phone}</span>
      </div>
      <div class="review-item">
        <span class="review-label">Institution:</span>
        <span class="review-value">${data.personal.institution}</span>
      </div>
    </div>
    
    <div class="review-category">
      <h4>Selected Competitions</h4>
  `;
  
  data.competitions.forEach(compId => {
    const comp = appData.competitions.find(c => c.id === compId);
    html += `
      <div class="review-item">
        <span class="review-label">${comp.name}:</span>
        <span class="review-value">₹${comp.price} (${comp.type.toUpperCase()})</span>
      </div>
    `;
  });
  
  html += `
      <div class="review-item" style="border-top: 1px solid var(--pixel-green); margin-top: 8px; padding-top: 8px;">
        <span class="review-label" style="font-weight: bold;">Total Amount:</span>
        <span class="review-value" style="color: var(--pixel-yellow); font-weight: bold;">₹${data.totalPrice}</span>
      </div>
    </div>
  `;
  
  // Team information - only show if there are actual team competitions
  
  reviewSection.innerHTML = html;
}

function handleSubmit(e) {
  e.preventDefault();
  
  if (!validateCurrentStep()) {
    soundSystem.playSound('error');
    return;
  }
  
  // Collect final form data
  formData = collectFormData();
  
  // Simulate form submission
  submitBtn.textContent = 'SUBMITTING...';
  submitBtn.disabled = true;
  
  setTimeout(() => {
    soundSystem.playSound('success');
    showSuccessModal();
    submitBtn.textContent = 'REGISTER!';
    submitBtn.disabled = false;
  }, 2000);
}

function showSuccessModal() {
  successModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeSuccessModal() {
  successModal.classList.add('hidden');
  document.body.style.overflow = 'auto';
  
  soundSystem.playSound('click');
  
  // Reset form
  form.reset();
  selectedCompetitions = [];
  currentStep = 1;
  updateStep();
  
  // Reset competition cards
  document.querySelectorAll('.competition-card').forEach(card => {
    card.classList.remove('selected');
    const checkbox = card.querySelector('.competition-checkbox');
    if (checkbox) checkbox.checked = false;
  });
}

// Add CSS for error state
const errorStyle = document.createElement('style');
errorStyle.textContent = `
  .form-control.error,
  input.error,
  select.error,
  textarea.error {
    border-color: var(--pixel-red) !important;
    box-shadow: 0 0 5px var(--pixel-red) !important;
  }
  
  @keyframes slideIn {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }
`;
document.head.appendChild(errorStyle);