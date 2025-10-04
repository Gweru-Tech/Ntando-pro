        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    }

    // Utility Functions
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

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

    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    // Search Functionality
    function initializeSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', debounce(handleSearch, 300));
        }
    }

    function handleSearch(e) {
        const query = e.target.value.toLowerCase();
        const serviceCards = document.querySelectorAll('.service-card');
        
        serviceCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();
            
            if (title.includes(query) || description.includes(query)) {
                card.style.display = 'block';
                card.classList.add('search-match');
            } else {
                card.style.display = 'none';
                card.classList.remove('search-match');
            }
        });
    }

    // Filter Functionality
    function initializeFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', handleFilter);
        });
    }

    function handleFilter(e) {
        const filter = e.target.dataset.filter;
        const serviceCards = document.querySelectorAll('.service-card');
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');
        
        // Filter services
        serviceCards.forEach(card => {
            const service = services.find(s => s.name === card.querySelector('h3').textContent);
            
            if (filter === 'all' || service.category === filter) {
                card.style.display = 'block';
                card.classList.add('filter-match');
            } else {
                card.style.display = 'none';
                card.classList.remove('filter-match');
            }
        });
    }

    // Performance Monitoring
    function trackPagePerformance() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                const perfData = performance.getEntriesByType('navigation')[0];
                const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
                
                console.log(`Page load time: ${loadTime}ms`);
                
                // Store performance data
                const perfHistory = JSON.parse(localStorage.getItem('performanceHistory') || '[]');
                perfHistory.push({
                    timestamp: Date.now(),
                    loadTime: loadTime,
                    url: window.location.href
                });
                
                // Keep only last 50 entries
                if (perfHistory.length > 50) {
                    perfHistory.splice(0, perfHistory.length - 50);
                }
                
                localStorage.setItem('performanceHistory', JSON.stringify(perfHistory));
            });
        }
    }

    // Error Handling
    window.addEventListener('error', (e) => {
        console.error('JavaScript Error:', e.error);
        
        // Log error for admin
        const errorLog = JSON.parse(localStorage.getItem('errorLog') || '[]');
        errorLog.push({
            timestamp: Date.now(),
            message: e.message,
            filename: e.filename,
            lineno: e.lineno,
            colno: e.colno,
            stack: e.error ? e.error.stack : null
        });
        
        // Keep only last 20 errors
        if (errorLog.length > 20) {
            errorLog.splice(0, errorLog.length - 20);
        }
        
        localStorage.setItem('errorLog', JSON.stringify(errorLog));
    });

    // Analytics Tracking
    function trackEvent(eventName, eventData = {}) {
        const event = {
            name: eventName,
            data: eventData,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };
        
        const analytics = JSON.parse(localStorage.getItem('analytics') || '[]');
        analytics.push(event);
        
        // Keep only last 100 events
        if (analytics.length > 100) {
            analytics.splice(0, analytics.length - 100);
        }
        
        localStorage.setItem('analytics', JSON.stringify(analytics));
    }

    // Track page view
    trackEvent('page_view', {
        page: window.location.pathname,
        referrer: document.referrer
    });

    // Track scroll depth
    let maxScrollDepth = 0;
    window.addEventListener('scroll', throttle(() => {
        const scrollDepth = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
        if (scrollDepth > maxScrollDepth) {
            maxScrollDepth = scrollDepth;
            if (scrollDepth % 25 === 0) { // Track at 25%, 50%, 75%, 100%
                trackEvent('scroll_depth', { depth: scrollDepth });
            }
        }
    }, 1000));

    // Accessibility Enhancements
    function initializeAccessibility() {
        // Keyboard navigation for mobile menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const mobileMenu = document.getElementById('mobileMenu');
                const loginModal = document.getElementById('loginModal');
                const adminPanel = document.getElementById('adminPanel');
                
                if (mobileMenu.classList.contains('active')) {
                    mobileMenu.classList.remove('active');
                }
                if (loginModal.classList.contains('active')) {
                    loginModal.classList.remove('active');
                }
                if (adminPanel.classList.contains('active')) {
                    adminPanel.classList.remove('active');
                }
            }
        });

        // Focus management for modals
        const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        
        function trapFocus(element) {
            const focusableContent = element.querySelectorAll(focusableElements);
            const firstFocusableElement = focusableContent[0];
            const lastFocusableElement = focusableContent[focusableContent.length - 1];

            element.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    if (e.shiftKey) {
                        if (document.activeElement === firstFocusableElement) {
                            lastFocusableElement.focus();
                            e.preventDefault();
                        }
                    } else {
                        if (document.activeElement === lastFocusableElement) {
                            firstFocusableElement.focus();
                            e.preventDefault();
                        }
                    }
                }
            });
        }

        // Apply focus trap to modals
        trapFocus(document.getElementById('loginModal'));
        trapFocus(document.getElementById('adminPanel'));
    }

    // Lazy Loading for Images
    function initializeLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    // Service Worker Registration
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }

    // PWA Install Prompt
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // Show install button
        const installBtn = document.getElementById('installBtn');
        if (installBtn) {
            installBtn.style.display = 'block';
            installBtn.addEventListener('click', () => {
                installBtn.style.display = 'none';
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the install prompt');
                        trackEvent('pwa_install', { result: 'accepted' });
                    } else {
                        console.log('User dismissed the install prompt');
                        trackEvent('pwa_install', { result: 'dismissed' });
                    }
                    deferredPrompt = null;
                });
            });
        }
    });

    // Initialize additional features
    document.addEventListener('DOMContentLoaded', function() {
        loadSettings();
        initializeSearch();
        initializeFilters();
        trackPagePerformance();
        initializeAccessibility();
        initializeLazyLoading();
    });

    // Export functions for global access
    window.NtandoModsPro = {
        toggleTheme,
        showNotification,
        trackEvent,
        deleteService,
        editService,
        deleteMessage,
        replyToMessage,
        switchAdminTab
    };
</script>

<!-- Additional CSS for new features -->
<style>
    /* Notification Styles */
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--card-bg);
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        z-index: 10000;
        max-width: 400px;
    }

    .notification.show {
        transform: translateX(0);
    }

    .notification-success {
        border-left: 4px solid #10b981;
    }

    .notification-error {
        border-left: 4px solid #ef4444;
    }

    .notification-info {
        border-left: 4px solid var(--primary);
    }

    .notification-close {
        background: none;
        border: none;
        color: var(--text-light);
        cursor: pointer;
        padding: 4px;
        margin-left: auto;
    }

    /* Loading Spinner */
    .loading-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        display: inline-block;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    /* Search and Filter Styles */
    .search-filter-container {
        display: flex;
        gap: 20px;
        margin-bottom: 40px;
        flex-wrap: wrap;
    }

    .search-box {
        flex: 1;
        min-width: 250px;
    }

    .search-box input {
        width: 100%;
        padding: 12px 16px;
        border: 1px solid var(--border);
        border-radius: 8px;
        background: var(--card-bg);
        color: var(--text);
        font-size: 16px;
    }

    .filter-buttons {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    }

    .filter-btn {
        padding: 8px 16px;
        border: 1px solid var(--border);
        border-radius: 20px;
        background: var(--card-bg);
        color: var(--text);
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 14px;
    }

    .filter-btn:hover,
    .filter-btn.active {
        background: var(--primary);
        color: white;
        border-color: var(--primary);
    }

    /* Cursor Trail */
    .cursor-trail {
        position: fixed;
        width: 4px;
        height: 4px;
        background: var(--primary);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        animation: cursorTrail 0.5s ease-out forwards;
    }

    @keyframes cursorTrail {
        0% {
            opacity: 1;
            transform: scale(1);
        }
        100% {
            opacity: 0;
            transform: scale(0);
        }
    }

    /* Progress Bar */
    .progress-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background: rgba(255, 255, 255, 0.1);
        z-index: 9999;
    }

    .progress-bar {
        height: 100%;
        background: linear-gradient(90deg, var(--primary), var(--secondary));
        width: 0%;
        transition: width 0.3s ease;
    }

    /* Particle System */
    .particle-system {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
    }

    .particle {
        position: absolute;
        background: var(--primary);
        border-radius: 50%;
        opacity: 0.1;
    }

    @keyframes float {
        0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
        }
        10% {
            opacity: 0.1;
        }
        90% {
            opacity: 0.1;
        }
        100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
        }
    }

    /* Lazy Loading */
    img.lazy {
        opacity: 0;
        transition: opacity 0.3s;
    }

    img.lazy.loaded {
        opacity: 1;
    }

    /* Install Button */
    #installBtn {
        display: none;
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--primary);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 25px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        font-weight: 600;
        transition: all 0.3s ease;
    }

    #installBtn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    }

    /* Responsive Design Improvements */
    @media (max-width: 768px) {
        .search-filter-container {
            flex-direction: column;
        }

        .filter-buttons {
            justify-content: center;
        }

        .notification {
            right: 10px;
            left: 10px;
            max-width: none;
        }

        .cursor-trail {
            display: none;
        }
    }

    /* High Contrast Mode */
    @media (prefers-contrast: high) {
        .service-card,
        .feature-item,
        .contact-item {
            border: 2px solid var(--text);
        }

        .btn,
        .admin-btn {
            border: 2px solid currentColor;
        }
    }

    /* Reduced Motion */
    @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }

        .particle-system {
            display: none;
        }

        .cursor-trail {
            display: none;
        }
    }

    /* Print Styles */
    @media print {
        .navbar,
        .admin-access,
        .particle-system,
        .progress-container,
        #installBtn,
        .notification {
            display: none !important;
        }

        .hero {
            background: white !important;
            color: black !important;
        }

        .service-card,
        .feature-item {
            break-inside: avoid;
        }
    }
</style>

<!-- PWA Install Button -->
<button id="installBtn">
    <i class="fas fa-download"></i>
    Install App
</button>

<!-- Progress Bar -->
<div class="progress-container">
    <div class="progress-bar" id="progressBar"></div>
</div>

<!-- Particle System -->
<div class="particle-system" id="particleSystem"></div>

</body>
</html>
