// Export/Import Data (completing the cut-off function)
function exportData() {
    const data = {
        services: services,
        messages: messages,
        settings: JSON.parse(localStorage.getItem('settings') || '{}'),
        exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ntando-mods-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('Data exported successfully!', 'success');
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.services) {
                services = data.services;
                saveServices();
                renderServices();
                loadServicesAdmin();
            }
            
            if (data.messages) {
                messages = data.messages;
                saveMessages();
                loadMessagesAdmin();
            }
            
            if (data.settings) {
                localStorage.setItem('settings', JSON.stringify(data.settings));
            }
            
            updateDashboardStats();
            showNotification('Data imported successfully!', 'success');
        } catch (error) {
            showNotification('Error importing data. Please check the file format.', 'error');
        }
    };
    reader.readAsText(file);
}

// Analytics and Tracking
function trackPageView() {
    const pageViews = parseInt(localStorage.getItem('pageViews') || '0') + 1;
    localStorage.setItem('pageViews', pageViews.toString());
    localStorage.setItem('lastVisit', new Date().toISOString());
}

function getAnalytics() {
    return {
        pageViews: parseInt(localStorage.getItem('pageViews') || '0'),
        lastVisit: localStorage.getItem('lastVisit'),
        totalServices: services.length,
        totalMessages: messages.length,
        userAgent: navigator.userAgent,
        language: navigator.language
    };
}

// Service Worker Registration (for PWA functionality)
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

// Initialize analytics
trackPageView();

// Add keyboard shortcuts info
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === '?') {
        showKeyboardShortcuts();
    }
});

function showKeyboardShortcuts() {
    const shortcuts = `
        Keyboard Shortcuts:
        Ctrl + K: Open Admin Login
        Escape: Close Modals
        Ctrl + Shift + ?: Show this help
    `;
    alert(shortcuts);
}

// Mobile menu functionality
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('mobile-active');
}

// Add mobile menu styles
const mobileMenuStyles = `
    @media (max-width: 768px) {
        .nav-links.mobile-active {
            display: flex;
            position: fixed;
            top: 70px;
            left: 0;
            right: 0;
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            flex-direction: column;
            padding: 2rem;
            border-bottom: 1px solid rgba(37, 99, 235, 0.2);
            z-index: 998;
        }
    }
`;

// Add the mobile menu styles to the document
const styleSheet = document.createElement('style');
styleSheet.textContent = mobileMenuStyles;
document.head.appendChild(styleSheet);

// Add click handler for mobile menu button
document.querySelector('.mobile-menu-btn').addEventListener('click', toggleMobileMenu);
