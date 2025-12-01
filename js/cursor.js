(function() {
            // Create cursor elements
            const cursorDot = document.createElement('div');
            cursorDot.className = 'cursor-dot';
            
            const cursorOutline = document.createElement('div');
            cursorOutline.className = 'cursor-outline';
            
            const buttonBorder = document.createElement('div');
            buttonBorder.className = 'button-border';
            
            // Append to body when DOM is ready
            if (document.body) {
                document.body.appendChild(cursorDot);
                document.body.appendChild(cursorOutline);
                document.body.appendChild(buttonBorder);
            } else {
                document.addEventListener('DOMContentLoaded', () => {
                    document.body.appendChild(cursorDot);
                    document.body.appendChild(cursorOutline);
                    document.body.appendChild(buttonBorder);
                });
            }

            let mouseX = 0, mouseY = 0;
            let outlineX = 0, outlineY = 0;
            let targetOutlineX = 0, targetOutlineY = 0;
            let isHoveringButton = false;
            let currentButton = null;

            document.addEventListener('mousemove', (e) => {
                mouseX = e.clientX;
                mouseY = e.clientY;
                
                cursorDot.style.left = mouseX + 'px';
                cursorDot.style.top = mouseY + 'px';
                
                if (!isHoveringButton) {
                    targetOutlineX = mouseX;
                    targetOutlineY = mouseY;
                }
            });

            function animateOutline() {
                // Smooth animation
                outlineX += (targetOutlineX - outlineX) * 0.25;
                outlineY += (targetOutlineY - outlineY) * 0.25;
                
                cursorOutline.style.left = outlineX + 'px';
                cursorOutline.style.top = outlineY + 'px';
                
                // Update button outline position if hovering
                if (isHoveringButton && currentButton) {
                    updateOutlineToButton(currentButton);
                }
                
                requestAnimationFrame(animateOutline);
            }
            animateOutline();

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
                
                // Get border properties
                const borderWidth = parseFloat(computedStyle.borderWidth) || 0;
                const borderColor = computedStyle.borderColor;
                const borderRadius = computedStyle.borderRadius;
                const borderStyle = computedStyle.borderStyle;
                
                // Position outline to match button exactly
                targetOutlineX = rect.left + rect.width / 2;
                targetOutlineY = rect.top + rect.height / 2;
                
                // Set outline dimensions to match button exactly (including border)
                cursorOutline.style.width = rect.width + 'px';
                cursorOutline.style.height = rect.height + 'px';
                cursorOutline.style.borderRadius = borderRadius;
                
                if (borderWidth > 0) {
                    // Button has border - match it exactly
                    cursorOutline.style.borderWidth = borderWidth + 'px';
                    cursorOutline.style.borderColor = borderColor;
                    cursorOutline.style.borderStyle = borderStyle;
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
                
                button.addEventListener('mouseleave', () => {
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
                });
            }

            // Initialize on existing elements
            function initCursor() {
                document.querySelectorAll('button').forEach(setupButtonHover);
                document.querySelectorAll('.btn-cmn').forEach(setupButtonHover);
            }

            // Run when DOM is ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initCursor);
            } else {
                initCursor();
            }

            // Observer for dynamically added elements
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) { // Element node
                            if (node.tagName === 'BUTTON') {
                                setupButtonHover(node);
                            } else if (node.classList && node.classList.contains('btn-cmn')) {
                                setupButtonHover(node);
                            }
                            // Check children
                            node.querySelectorAll && node.querySelectorAll('button').forEach(setupButtonHover);
                            node.querySelectorAll && node.querySelectorAll('.btn-cmn').forEach(setupButtonHover);
                        }
                    });
                });
            });

            observer.observe(document.body || document.documentElement, {
                childList: true,
                subtree: true
            });
        })();