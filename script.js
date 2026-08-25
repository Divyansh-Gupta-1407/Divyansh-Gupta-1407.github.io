document.addEventListener('DOMContentLoaded', () => {
    // 1. Top Nav Buttons
    const redBtn = document.querySelector('.dot.red');
    const yellowBtn = document.querySelector('.dot.yellow');
    const greenBtn = document.querySelector('.dot.green');

    if (redBtn) {
        redBtn.addEventListener('click', () => {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.close();
                document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;background-color:#000;color:#fff;font-family:monospace;font-size:1.5rem;">[Session closed by user]</div>';
            }
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
            inputWrapper.innerHTML = '<span class="prompt">$</span> <input type="text" class="term-input" autocomplete="off" spellcheck="false" autofocus style="background:transparent;border:none;color:var(--text-main);caret-color:var(--accent-green);font-family:inherit;font-size:inherit;outline:none;width:80%;">';
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
            const args = cmd.trim().split(/\s+/);
            const baseCmd = args[0].toLowerCase();

            switch(baseCmd) {
                case 'whoami': return 'divyansh.gupta - most awesome one';
                case 'date': return new Date().toString();
                case 'help': return 'Available commands: whoami, date, ls, cat, cd, clear, sudo, echo';
                case 'sudo': return 'nice try... but this incident will be reported to santa.';
                case 'clear': 
                    setTimeout(() => {
                        Array.from(termBody.children).forEach(child => {
                            if (!child.classList.contains('active-cmd')) {
                                child.remove();
                            }
                        });
                    }, 10);
                    return '';
                case 'ls': 
                    return 'projects/ &nbsp;&nbsp;about.txt &nbsp;&nbsp;interests.txt &nbsp;&nbsp;role.txt';
                case 'cat':
                    if (args.length < 2) return 'cat: missing file operand';
                    const file = args[1].toLowerCase();
                    if (file === 'about.txt') return 'I am a CS student at MIT, Bengaluru building intelligent backends.';
                    if (file === 'interests.txt') return '- Coding<br>- Reading<br>- Developing<br>- System Design<br>- Open Source Contribution<br>- Tinkering with Linux';
                    if (file === 'role.txt') return 'backend engineer & ML enthusiast<br>currently seeking new opportunities';
                    if (file === 'projects/' || file === 'projects') return 'cat: projects/: Is a directory';
                    return `cat: ${args[1]}: No such file or directory`;
                case 'cd':
                    if (args.length < 2 || args[1] === '~') return '';
                    let dir = args[1].toLowerCase();
                    if (dir.endsWith('/')) dir = dir.slice(0, -1); // remove trailing slash
                    
                    if (['projects', 'stack', 'contact', 'about'].includes(dir)) {
                        const targetSec = Array.from(document.querySelectorAll('.section-label')).find(el => el.textContent.toLowerCase().includes(dir));
                        if (targetSec) {
                            setTimeout(() => targetSec.scrollIntoView({ behavior: 'smooth' }), 100);
                            return `Navigating to ${dir}...`;
                        }
                    }
                    if (dir === '..') return '';
                    return `cd: ${args[1]}: No such file or directory`;
                case 'echo':
                    return args.slice(1).join(' ');
                case 'rm':
                    if (args.includes('-rf')) return "Permission denied. Also, please don't.";
                    return "rm: missing operand";
                default:
                    return `zsh: command not found: ${baseCmd}`;
            }
        }
    }

});
