document.addEventListener('DOMContentLoaded', () => {
    // 1. Top Nav Buttons
    const redBtn = document.querySelector('.dot.red');
    const yellowBtn = document.querySelector('.dot.yellow');
    const greenBtn = document.querySelector('.dot.green');

    if (redBtn) {
        redBtn.addEventListener('click', () => {
            document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;background-color:#000;color:#fff;font-family:monospace;font-size:1.5rem;">[Session closed by user]</div>';
        });
    }

    if (yellowBtn) {
        let isMinimized = false;
        yellowBtn.addEventListener('click', () => {
            const elements = document.querySelectorAll('header, section, .term-box, .footer-info');
            isMinimized = !isMinimized;
            elements.forEach(el => {
                el.style.display = isMinimized ? 'none' : '';
            });
        });
    }

    if (greenBtn) {
        greenBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => console.log(err));
            } else {
                document.exitFullscreen();
            }
        });
    }

    // 2. Top Terminal Typewriter & Interactivity
    const topTermBox = document.querySelector('.term-box');
    const termBody = document.querySelector('.term-body');

    if (termBody) {
        // Get all original child elements and remove them
        const originalNodes = Array.from(termBody.children);
        termBody.innerHTML = '';
        
        // Hide terminal completely during initial setup just in case
        // Actually, let's just let it be empty and fill it
        
        let i = 0;
        
        function typeNode() {
            if (i < originalNodes.length) {
                let node = originalNodes[i];
                
                if (node.classList.contains('cmd')) {
                    // Check if it's the final empty prompt
                    if (node.querySelector('.cursor') || node.textContent.trim() === '$') {
                        addInteractiveTopTerminal();
                        return;
                    }

                    // It's a command that needs typing
                    let text = node.textContent.replace('$', '').trim();
                    let p = document.createElement('div');
                    p.className = 'cmd';
                    p.innerHTML = '<span class="prompt">$</span> <span class="typing"></span><span class="cursor"></span>';
                    termBody.appendChild(p);

                    let typingSpan = p.querySelector('.typing');
                    let charIndex = 0;

                    function typeChar() {
                        if (charIndex < text.length) {
                            typingSpan.textContent += text.charAt(charIndex);
                            charIndex++;
                            setTimeout(typeChar, 40); // 40ms typing speed
                        } else {
                            p.querySelector('.cursor').remove();
                            setTimeout(() => {
                                i++;
                                // Immediately append the output if next node is .out
                                if (i < originalNodes.length && originalNodes[i].classList.contains('out')) {
                                    termBody.appendChild(originalNodes[i]);
                                    i++;
                                }
                                setTimeout(typeNode, 300); // Wait before next command
                            }, 200);
                        }
                    }
                    typeChar();
                } else {
                    // It's an output div that somehow appeared out of order, just append it
                    termBody.appendChild(node);
                    i++;
                    typeNode();
                }
            } else {
                addInteractiveTopTerminal();
            }
        }
        
        // Start typing after a short delay
        setTimeout(typeNode, 500);

        function addInteractiveTopTerminal() {
            let inputWrapper = document.createElement('div');
            inputWrapper.className = 'cmd active-cmd';
            inputWrapper.innerHTML = '<span class="prompt">$</span> <input type="text" class="term-input" autocomplete="off" spellcheck="false" autofocus style="background:transparent;border:none;color:var(--text-main);font-family:inherit;font-size:inherit;outline:none;width:80%;">';
            termBody.appendChild(inputWrapper);

            let input = inputWrapper.querySelector('.term-input');
            
            // Focus input when terminal is clicked
            topTermBox.addEventListener('click', () => input.focus());

            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    let val = this.value.trim();
                    let output = document.createElement('div');
                    output.className = 'out';
                    
                    if (val) {
                        output.innerHTML = handleTopCommand(val);
                    }

                    // Convert input to static text
                    let staticCmd = document.createElement('div');
                    staticCmd.className = 'cmd';
                    staticCmd.innerHTML = `<span class="prompt">$</span> ${val}`;
                    
                    termBody.insertBefore(staticCmd, inputWrapper);
                    if (val && output.innerHTML !== '') {
                        termBody.insertBefore(output, inputWrapper);
                    }
                    
                    this.value = '';
                    // Scroll to bottom
                    termBody.scrollTop = termBody.scrollHeight;
                }
            });
        }

        function handleTopCommand(cmd) {
            const lowerCmd = cmd.toLowerCase();
            switch(lowerCmd) {
                case 'whoami': return 'divyansh.gupta - The coolest person here.';
                case 'date': return new Date().toString();
                case 'help': return 'Available commands: whoami, date, projects, clear, sudo, skills, about, echo [text]';
                case 'projects': return 'Scroll down to see my projects, or click them directly!';
                case 'sudo': return 'Nice try... but this incident will be reported to santa.';
                case 'skills': return 'Python, C++, ML, Backend... basically making machines do cool stuff.';
                case 'about': return 'I am a CS student at MIT, Bengaluru building intelligent backends.';
                case 'clear': 
                    setTimeout(() => {
                        Array.from(termBody.children).forEach(child => {
                            if (!child.classList.contains('active-cmd')) {
                                child.remove();
                            }
                        });
                    }, 10);
                    return '';
                case 'ls': return 'projects/  about.txt  interests.txt';
                default:
                    if (lowerCmd.startsWith('echo ')) return cmd.substring(5);
                    return `zsh: command not found: ${cmd}`;
            }
        }
    }

    // 3. Bottom Terminal Interactivity
    const contactCmd = document.querySelector('.contact-cmd');
    if (contactCmd) {
        // Save the old content, replace with an input
        contactCmd.innerHTML = '<span class="prompt">$</span> <input type="text" class="term-input" value=\'mail -s "hello" gdivyansh1407@gmail.com\' autocomplete="off" spellcheck="false" style="background:transparent;border:none;color:var(--text-main);font-family:inherit;font-size:inherit;outline:none;width:80%;">';
        const input = contactCmd.querySelector('.term-input');

        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                let val = this.value.trim();
                if (val.includes('mail')) {
                    // Redirect to gmail
                    window.open('https://mail.google.com/mail/?view=cm&fs=1&to=gdivyansh1407@gmail.com', '_blank');
                } else if (val.toLowerCase() === 'clear') {
                    this.value = '';
                } else if (val) {
                    alert(`Command executed: ${val}`);
                }
            }
        });
    }
});
