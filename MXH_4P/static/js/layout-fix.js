// Layout fix to prevent sidebar jump
(function() {
    'use strict';
    
    // Ensure scrollbar gutter is always present
    document.documentElement.style.overflowY = 'scroll';
    
    // Prevent layout shift on page load
    window.addEventListener('DOMContentLoaded', function() {
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            // Force reflow to stabilize layout
            mainContent.style.display = 'none';
            mainContent.offsetHeight; // Trigger reflow
            mainContent.style.display = '';
        }
    });
})();
