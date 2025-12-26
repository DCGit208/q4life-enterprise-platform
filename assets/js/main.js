/**
 * Q4LIFE WEBSITE - MAIN JAVASCRIPT
 * Version: 2.0
 * Handles: Navigation, Mobile Menu, Smooth Scroll, Animations
 */

// ============================================
// MOBILE MENU TOGGLE
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInside = navMenu.contains(event.target) || mobileMenuToggle.contains(event.target);
            
            if (!isClickInside && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
        
        // Close menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 1023) {
                    navMenu.classList.remove('active');
                    mobileMenuToggle.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });
    }
});

// ============================================
// STICKY HEADER ON SCROLL
// ============================================
window.addEventListener('scroll', function() {
    const header = document.getElementById('header');
    
    if (header) {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
});

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        // Only apply smooth scroll if it's not just '#'
        if (href !== '#' && href.length > 1) {
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                
                const headerHeight = document.getElementById('header')?.offsetHeight || 0;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// ============================================
// INTERSECTION OBSERVER FOR FADE-IN ANIMATIONS
// ============================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all cards and sections
document.addEventListener('DOMContentLoaded', function() {
    const elementsToAnimate = document.querySelectorAll('.card, .division-card, section:not(.hero)');
    elementsToAnimate.forEach(el => {
        observer.observe(el);
    });
});

// ============================================
// STATS COUNTER ANIMATION (when visible)
// ============================================
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16); // 60fps
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        
        if (current >= target) {
            element.textContent = formatStatNumber(target);
            clearInterval(timer);
        } else {
            element.textContent = formatStatNumber(Math.floor(current));
        }
    }, 16);
}

function formatStatNumber(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
}

// Animate stats when they come into view
const statsObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statElement = entry.target;
            const targetValue = statElement.getAttribute('data-target');
            
            if (targetValue) {
                animateCounter(statElement, parseInt(targetValue));
                statsObserver.unobserve(statElement);
            }
        }
    });
}, { threshold: 0.5 });

document.addEventListener('DOMContentLoaded', function() {
    // Find all stat numbers and set data-target from current text
    document.querySelectorAll('.stat-number').forEach(stat => {
        const text = stat.textContent.trim();
        let targetValue = parseInt(text.replace(/[^0-9]/g, ''));
        
        if (text.includes('K')) {
            targetValue = targetValue * 1000;
        }
        
        if (text.includes('%')) {
            // For percentages, just use the number as is
            targetValue = parseInt(text.replace('%', ''));
            stat.setAttribute('data-target', targetValue);
            stat.textContent = '0%';
            
            // Custom animation for percentage
            statsObserver.observe(stat);
            stat.addEventListener('counterStart', function() {
                let current = 0;
                const timer = setInterval(() => {
                    current += 0.5;
                    if (current >= targetValue) {
                        stat.textContent = targetValue.toFixed(1) + '%';
                        clearInterval(timer);
                    } else {
                        stat.textContent = current.toFixed(1) + '%';
                    }
                }, 16);
            });
        } else if (!isNaN(targetValue)) {
            stat.setAttribute('data-target', targetValue);
            stat.textContent = '0';
            statsObserver.observe(stat);
        }
    });
});

// ============================================
// FORM VALIDATION (for quote/contact forms)
// ============================================
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\d\s\-\+\(\)]+$/;
    return phone.length >= 10 && re.test(phone);
}

// Add form validation to all forms
document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('form[data-validate="true"]');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            let isValid = true;
            const errors = [];
            
            // Validate required fields
            const requiredFields = form.querySelectorAll('[required]');
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    errors.push(`${field.name || 'Field'} is required`);
                    field.classList.add('error');
                } else {
                    field.classList.remove('error');
                }
            });
            
            // Validate email fields
            const emailFields = form.querySelectorAll('input[type="email"]');
            emailFields.forEach(field => {
                if (field.value && !validateEmail(field.value)) {
                    isValid = false;
                    errors.push('Please enter a valid email address');
                    field.classList.add('error');
                }
            });
            
            // Validate phone fields
            const phoneFields = form.querySelectorAll('input[type="tel"]');
            phoneFields.forEach(field => {
                if (field.value && !validatePhone(field.value)) {
                    isValid = false;
                    errors.push('Please enter a valid phone number');
                    field.classList.add('error');
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                
                // Display errors
                let errorContainer = form.querySelector('.form-errors');
                if (!errorContainer) {
                    errorContainer = document.createElement('div');
                    errorContainer.className = 'form-errors';
                    errorContainer.style.cssText = 'background-color: #f44336; color: white; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;';
                    form.insertBefore(errorContainer, form.firstChild);
                }
                
                errorContainer.innerHTML = '<strong>Please fix the following errors:</strong><ul>' + 
                    errors.map(err => `<li>${err}</li>`).join('') + 
                    '</ul>';
                
                // Scroll to errors
                errorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    });
});

// ============================================
// WHATSAPP HELPER (pre-fill messages)
// ============================================
function initWhatsAppLinks() {
    const whatsappLinks = document.querySelectorAll('a[href*="wa.me"]');
    
    whatsappLinks.forEach(link => {
        // Track WhatsApp clicks for analytics
        link.addEventListener('click', function() {
            console.log('WhatsApp contact initiated');
            
            // If you have Google Analytics or Facebook Pixel
            if (typeof gtag !== 'undefined') {
                gtag('event', 'whatsapp_click', {
                    'event_category': 'contact',
                    'event_label': window.location.pathname
                });
            }
            
            if (typeof fbq !== 'undefined') {
                fbq('track', 'Contact', {
                    method: 'WhatsApp',
                    page: window.location.pathname
                });
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', initWhatsAppLinks);

// ============================================
// RESPONSIVE TABLES (wrap in container on mobile)
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const tables = document.querySelectorAll('table');
    
    tables.forEach(table => {
        if (!table.parentElement.classList.contains('table-responsive')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'table-responsive';
            wrapper.style.cssText = 'overflow-x: auto; -webkit-overflow-scrolling: touch;';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        }
    });
});

// ============================================
// LAZY LOAD IMAGES (for better performance)
// ============================================
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.getAttribute('data-src');
                
                if (src) {
                    img.src = src;
                    img.removeAttribute('data-src');
                    img.classList.add('loaded');
                }
                
                observer.unobserve(img);
            }
        });
    });
    
    document.addEventListener('DOMContentLoaded', function() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => imageObserver.observe(img));
    });
}

// ============================================
// CONSOLE BRANDING (fun easter egg)
// ============================================
console.log('%cQ4Life', 'font-size: 48px; font-weight: bold; color: #5199a8; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);');
console.log('%cBusinessing is everything, by everyone, everywhere.', 'font-size: 16px; color: #484848; font-style: italic;');
console.log('%cInterested in joining our team? Visit: https://q4-life.com/careers', 'font-size: 14px; color: #5199a8;');

// ============================================
// EXPORT FOR USE IN OTHER SCRIPTS
// ============================================
window.Q4Life = {
    validateEmail,
    validatePhone,
    animateCounter,
    formatStatNumber
};
