/* Custom cursor: a dot that tracks the pointer and an outline that eases
   toward it, snapping onto hovered buttons. */
(function (global) {
    const isCommonJs = typeof module !== 'undefined' && module.exports;
    const { onReady } = isCommonJs ? require('./utils') : global.PortfolioUtils;

    const HOVER_TARGETS = 'button, .btn-cmn';
    // Inline styles cleared when the outline detaches from a button.
    const OUTLINE_OVERRIDES = ['width', 'height', 'borderRadius', 'borderWidth', 'borderColor', 'borderStyle'];

    function initCursorEngine() {
        function createCursorElement(className) {
            const el = document.createElement('div');
            el.className = className;
            return el;
        }

        const cursorDot = createCursorElement('cursor-dot');
        const cursorOutline = createCursorElement('cursor-outline');
        const buttonBorder = createCursorElement('button-border');

        let mouseX = 0, mouseY = 0;
        let outlineX = 0, outlineY = 0;
        let targetOutlineX = 0, targetOutlineY = 0;
        let isHoveringButton = false;
        let currentButton = null;

        function moveTo(el, x, y) {
            el.style.left = x + 'px';
            el.style.top = y + 'px';
        }

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            moveTo(cursorDot, mouseX, mouseY);

            if (!isHoveringButton) {
                targetOutlineX = mouseX;
                targetOutlineY = mouseY;
            }
        });

        function animateOutline() {
            try {
                // Smooth animation
                outlineX += (targetOutlineX - outlineX) * 0.25;
                outlineY += (targetOutlineY - outlineY) * 0.25;

                cursorOutline.style.left = outlineX + 'px';
                cursorOutline.style.top = outlineY + 'px';

                // Update button outline position if hovering
                if (isHoveringButton && currentButton) {
                    if (currentButton.isConnected) {
                        updateOutlineToButton(currentButton);
                    } else {
                        // Hovered button was removed from the DOM; reset hover state
                        resetHoverState();
                    }
                }
            } catch (err) {
                console.error('cursor: animation frame failed', err);
            }

            requestAnimationFrame(animateOutline);
        }

        // Store the initial cursor-outline border color from CSS
        let initialOutlineColor = null;

        function getInitialOutlineColor() {
            if (!initialOutlineColor) {
                const outlineStyle = window.getComputedStyle(cursorOutline);
                initialOutlineColor = outlineStyle.borderColor || outlineStyle.borderTopColor || '#fff';
            }
            return initialOutlineColor;
        }

        function updateOutlineToButton(button) {
            const rect = button.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(button);
            const borderWidth = parseFloat(computedStyle.borderWidth) || 0;

            // Position outline to match button exactly
            targetOutlineX = rect.left + rect.width / 2;
            targetOutlineY = rect.top + rect.height / 2;

            // Set outline dimensions to match button exactly (including border)
            cursorOutline.style.width = rect.width + 'px';
            cursorOutline.style.height = rect.height + 'px';
            cursorOutline.style.borderRadius = computedStyle.borderRadius;

            if (borderWidth > 0) {
                // Button has border - match it exactly
                cursorOutline.style.borderWidth = borderWidth + 'px';
                cursorOutline.style.borderColor = computedStyle.borderColor;
                cursorOutline.style.borderStyle = computedStyle.borderStyle;
            } else {
                // Button has no border - use default cursor-outline color
                cursorOutline.style.borderWidth = '2px';
                cursorOutline.style.borderColor = getInitialOutlineColor();
                cursorOutline.style.borderStyle = 'solid';
            }
        }

        // Setup button hover effects
        function setupButtonHover(button) {
            button.addEventListener('mouseenter', () => {
                isHoveringButton = true;
                currentButton = button;

                cursorOutline.classList.add('hover-button');
                cursorDot.style.opacity = '0';

                updateOutlineToButton(button);
            });

            button.addEventListener('mouseleave', resetHoverState);
        }

        function resetHoverState() {
            isHoveringButton = false;
            currentButton = null;

            cursorOutline.classList.remove('hover-button');
            cursorDot.style.opacity = '1';

            // Reset outline to default state
            cursorOutline.style.width = '';
            cursorOutline.style.height = '';
            cursorOutline.style.borderRadius = '';
            cursorOutline.style.borderWidth = '';
            cursorOutline.style.borderColor = '';
            cursorOutline.style.borderStyle = '';

            targetOutlineX = mouseX;
            targetOutlineY = mouseY;
        }

        // Initialize on existing elements
        function initCursor() {
            document.querySelectorAll(HOVER_TARGETS).forEach(setupButtonHover);
        }

        // Observer for dynamically added elements
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType !== Node.ELEMENT_NODE) return;
                    if (node.matches(HOVER_TARGETS)) setupButtonHover(node);
                    node.querySelectorAll(HOVER_TARGETS).forEach(setupButtonHover);
                });
            });
        });

        onReady(() => {
            [cursorDot, cursorOutline, buttonBorder].forEach(el => document.body.appendChild(el));
            initCursor();
            observer.observe(document.body, { childList: true, subtree: true });
        });

        animateOutline();

        return {
            cursorDot,
            cursorOutline,
            buttonBorder,
            observer,
            animateOutline,
            updateOutlineToButton,
            setupButtonHover,
            initCursor,
            getState: () => ({ mouseX, mouseY, outlineX, outlineY, isHoveringButton, currentButton })
        };
    }

    if (isCommonJs) {
        module.exports = { initCursorEngine };
    } else {
        initCursorEngine();
    }
})(typeof window !== 'undefined' ? window : globalThis);
