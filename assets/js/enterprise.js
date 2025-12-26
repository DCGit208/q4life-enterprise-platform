/* ============================================
   Q4LIFE ENTERPRISE JAVASCRIPT
   Version: 3.0 ENTERPRISE EDITION
   Premium interactions & animations
   ============================================ */

// ============================================
// SMOOTH SCROLL & NAVIGATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Sticky header with scroll effect
    const header = document.getElementById('header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
    
    // ============================================
    // INTERSECTION OBSERVER - ANIMATIONS
    // ============================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe cards and sections
    document.querySelectorAll('.card, .stat-card').forEach(el => {
        observer.observe(el);
    });
    
    // ============================================
    // STATS COUNTER ANIMATION
    // ============================================
    const animateValue = (element, start, end, duration, suffix = '') => {
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                current = end;
                clearInterval(timer);
            }
            
            // Format large numbers
            let displayValue = Math.floor(current);
            if (end >= 1000000) {
                displayValue = (Math.floor(current / 100000) / 10).toFixed(1) + 'M';
            } else if (end >= 1000) {
                displayValue = (Math.floor(current / 100) / 10).toFixed(1) + 'K';
            }
            
            element.textContent = displayValue + suffix;
        }, 16);
    };
    
    // Observe stat numbers for animation
    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumber = entry.target;
                const text = statNumber.textContent;
                
                // Extract number and suffix
                let numValue = parseFloat(text.replace(/[^0-9.]/g, ''));
                let suffix = text.replace(/[0-9.,]/g, '');
                
                // Handle special formats like "$5.2B+"
                if (text.includes('B')) {
                    numValue = numValue * 1000000000;
                    suffix = 'B+';
                } else if (text.includes('M')) {
                    numValue = numValue * 1000000;
                    suffix = 'M+';
                } else if (text.includes('K')) {
                    numValue = numValue * 1000;
                    suffix = 'K+';
                }
                
                // Add $ prefix if present
                const hasPrefix = text.includes('$');
                if (hasPrefix) {
                    suffix = suffix;
                    statNumber.textContent = '$0' + suffix;
                } else {
                    statNumber.textContent = '0' + suffix;
                }
                
                // Animate
                setTimeout(() => {
                    const finalText = text;
                    let start = 0;
                    const duration = 2000;
                    const fps = 60;
                    const frames = duration / (1000 / fps);
                    const increment = numValue / frames;
                    let current = 0;
                    
                    const counter = setInterval(() => {
                        current += increment;
                        if (current >= numValue) {
                            statNumber.textContent = finalText;
                            clearInterval(counter);
                        } else {
                            // Format display
                            let display = '';
                            if (hasPrefix) display = '$';
                            
                            if (text.includes('B')) {
                                display += (current / 1000000000).toFixed(1) + 'B+';
                            } else if (text.includes('M')) {
                                display += (current / 1000000).toFixed(1) + 'M+';
                            } else if (text.includes('K')) {
                                display += (current / 1000).toFixed(1) + 'K+';
                            } else if (text.includes('%')) {
                                display += current.toFixed(1) + '%';
                            } else {
                                display += Math.floor(current);
                                if (text.includes('+')) display += '+';
                            }
                            
                            statNumber.textContent = display;
                        }
                    }, 1000 / fps);
                }, 200);
                
                statObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.stat-number').forEach(stat => {
        statObserver.observe(stat);
    });
    
    // ============================================
    // CARD HOVER EFFECTS
    // ============================================
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // ============================================
    // BUTTON RIPPLE EFFECT
    // ============================================
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.5);
                left: ${x}px;
                top: ${y}px;
                transform: scale(0);
                pointer-events: none;
                animation: ripple 0.6s ease-out;
            `;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Add ripple animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        .btn {
            position: relative;
            overflow: hidden;
        }
    `;
    document.head.appendChild(style);
    
    // ============================================
    // PARALLAX EFFECT ON SCROLL
    // ============================================
    const parallaxElements = document.querySelectorAll('.hero');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        parallaxElements.forEach(el => {
            const speed = 0.5;
            el.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
    
    // ============================================
    // LAZY LOADING FOR IMAGES
    // ============================================
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
    
    // ============================================
    // FORM VALIDATION ENHANCEMENT
    // ============================================
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const inputs = this.querySelectorAll('input[required], textarea[required], select[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = '#ef4444';
                    
                    // Add error message if not exists
                    if (!input.nextElementSibling || !input.nextElementSibling.classList.contains('error-message')) {
                        const error = document.createElement('span');
                        error.className = 'error-message';
                        error.style.cssText = 'color: #ef4444; font-size: 0.875rem; margin-top: 0.25rem; display: block;';
                        error.textContent = 'This field is required';
                        input.parentNode.insertBefore(error, input.nextSibling);
                    }
                } else {
                    input.style.borderColor = '';
                    const error = input.nextElementSibling;
                    if (error && error.classList.contains('error-message')) {
                        error.remove();
                    }
                }
                
                // Email validation
                if (input.type === 'email' && input.value) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(input.value)) {
                        isValid = false;
                        input.style.borderColor = '#ef4444';
                    }
                }
            });
            
            if (!isValid) {
                e.preventDefault();
            }
        });
        
        // Real-time validation
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                if (this.hasAttribute('required') && !this.value.trim()) {
                    this.style.borderColor = '#ef4444';
                } else {
                    this.style.borderColor = '';
                    const error = this.nextElementSibling;
                    if (error && error.classList.contains('error-message')) {
                        error.remove();
                    }
                }
            });
            
            input.addEventListener('input', function() {
                if (this.value.trim()) {
                    this.style.borderColor = '';
                    const error = this.nextElementSibling;
                    if (error && error.classList.contains('error-message')) {
                        error.remove();
                    }
                }
            });
        });
    });
    
    // ============================================
    // PERFORMANCE OPTIMIZATION
    // ============================================
    // Debounce function for scroll events
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Apply debounce to scroll-heavy operations
    const debouncedScroll = debounce(() => {
        // Add any heavy scroll operations here
    }, 100);
    
    window.addEventListener('scroll', debouncedScroll);
    
    // ============================================
    // CONSOLE BRANDING
    // ============================================
    console.log('%cQ4Life Enterprise Portal', 'font-size: 24px; font-weight: bold; color: #2563eb;');
    console.log('%cEnterprise-grade business infrastructure platform', 'font-size: 12px; color: #6b7280;');
    console.log('%cBuilt with precision and excellence', 'font-size: 11px; color: #9ca3af;');
});

// ============================================
// EXPORT FOR MODULE USE
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        // Export any functions needed
    };
}
