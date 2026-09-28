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
        const originalNodes = Array.from(termBody.children);
        termBody.innerHTML = '';

        // Instantly render all nodes except the trailing cursor prompt
        originalNodes.forEach(node => {
            if (node.classList.contains('cmd') && (node.querySelector('.cursor') || node.textContent.trim() === '$')) {
                // Skip the old empty prompt — we'll replace it with the interactive one
                return;
            }
            termBody.appendChild(node);
        });

        // Add interactive input immediately, then reset scroll to top
        addInteractiveTopTerminal();
        termBody.scrollTop = 0;

        function addInteractiveTopTerminal() {
            let inputWrapper = document.createElement('div');
            inputWrapper.className = 'cmd active-cmd';
            inputWrapper.style.position = 'relative';
            inputWrapper.innerHTML = `
                <span class="prompt">$</span> 
                <span class="input-display" style="white-space: pre-wrap; word-break: break-all;"></span><span class="cursor" style="background-color: var(--accent-green); opacity: 0.25; animation-name: none;"></span>
                <input type="text" class="term-input" autocomplete="off" spellcheck="false" autofocus style="position:absolute; opacity:0; width:1px; height:1px; left:0; top:0;">
            `;
            termBody.appendChild(inputWrapper);

            let input = inputWrapper.querySelector('.term-input');
            let display = inputWrapper.querySelector('.input-display');
            
            input.addEventListener('input', () => {
                display.textContent = input.value;
                termBody.scrollTop = termBody.scrollHeight; // Auto-adjust scroll when typing
            });
            
            // Dim cursor when terminal loses focus
            const blockCursor = inputWrapper.querySelector('.cursor');

            input.addEventListener('focus', () => {
                blockCursor.style.opacity = '1';
                blockCursor.style.animationName = 'blink';
            });

            input.addEventListener('blur', () => {
                blockCursor.style.opacity = '0.25';
                blockCursor.style.animationName = 'none';
            });
            
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
                    display.textContent = '';
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
                    return 'projects/ &nbsp;&nbsp;stack/ &nbsp;&nbsp;contact/ &nbsp;&nbsp;about.txt &nbsp;&nbsp;interests.txt &nbsp;&nbsp;role.txt';
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
