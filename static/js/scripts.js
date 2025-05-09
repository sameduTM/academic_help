document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('main-nav');
    
    menuToggle.addEventListener('click', function() {
        nav.classList.toggle('active');
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', !isExpanded);
    });
    
    // Close menu when clicking on a link (for mobile)
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                nav.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    });
    
    // Close menu when resizing to desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            nav.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });
});

// Updated link prevention with correct check for hash anchors
document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function (event) {
        if (this.hash === '#login' || this.hash === '#signup') {
            return;
        }
        event.preventDefault();
    });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      const headerHeight = document.querySelector('header').offsetHeight;
      
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - headerHeight,
          behavior: 'smooth'
        });
        
        // Update URL without jumping
        history.pushState(null, null, targetId);
      }
    });
});

// Modal functionality - Updated version
const authModal = document.getElementById('auth-modal');
const loginLinks = document.querySelectorAll('[href="#login"]');
const signupLinks = document.querySelectorAll('[href="#signup"]');
const closeModal = document.querySelector('.close-modal');
const authForms = document.querySelectorAll('.auth-form');
const authSwitches = document.querySelectorAll('.auth-switch');

// Open Login Modal
loginLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    showAuthModal('login');
  });
});

// Open Signup Modal
signupLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    showAuthModal('signup');
  });
});

// Close Modal
closeModal.addEventListener('click', () => {
  hideAuthModal();
});

// Click outside to close
authModal.addEventListener('click', (e) => {
  if (e.target === authModal) {
    hideAuthModal();
  }
});

// Escape key to close
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && authModal.classList.contains('active')) {
    hideAuthModal();
  }
});

// Form switching
authSwitches.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = e.target.getAttribute('href').replace('#', '');
    switchAuthForm(target);
  });
});

function showAuthModal(formType) {
  authModal.classList.add('active');
  document.body.style.overflow = 'hidden';
  switchAuthForm(formType);
}

function hideAuthModal() {
  authModal.classList.remove('active');
  document.body.style.overflow = '';
}

function switchAuthForm(formType) {
  authForms.forEach(form => {
    form.classList.remove('active');
  });
  document.getElementById(`${formType}-form`).classList.add('active');
}

// Update form submission handlers to point to PHP files
const API_BASE_URL = '';

// Signup Form Submission - Fixed selector
document.getElementById('signup-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    
    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        
        const response = await fetch(`${API_BASE_URL}/signup.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: document.getElementById('signup-name').value,
                email: document.getElementById('signup-email').value,
                password: document.getElementById('signup-password').value
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Signup failed');
        }
        
        alert('Signup successful! You can now login.');
        switchAuthForm('login');
        form.reset();
    } catch (error) {
        alert(error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
});

// Login Form Submission - Fixed selector
document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    
    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        
        const response = await fetch(`${API_BASE_URL}/login.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: document.getElementById('login-email').value,
                password: document.getElementById('login-password').value
            }),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }
        
        localStorage.setItem('user', JSON.stringify(data.user));
        updateAuthUI(data.user);
        hideAuthModal();
        alert(`Welcome back, ${data.user.name}!`);
    } catch (error) {
        alert(error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
});

// Remaining functions remain the same...
// (updateAuthUI, createUserButton, auth check, and logout functionality)