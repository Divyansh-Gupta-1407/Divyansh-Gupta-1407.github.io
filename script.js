document.addEventListener("DOMContentLoaded", () => {
    const sourceContent = document.getElementById("sourceContent");
    const typedContent = document.getElementById("typedContent");
    const lineNumbers = document.getElementById("lineNumbers");
    const cursorPosEl = document.getElementById("cursorPos");

    if (!sourceContent || !typedContent) return;

    const htmlString = sourceContent.innerHTML.trim();
    sourceContent.remove(); // Remove source from DOM

    // Tokenize the HTML string: tags, HTML entities, and characters
    const tokens = [];
    let i = 0;
    while (i < htmlString.length) {
        if (htmlString[i] === '<') {
            let tag = '';
            while (i < htmlString.length && htmlString[i] !== '>') {
                tag += htmlString[i];
                i++;
            }
            if (i < htmlString.length) {
                tag += htmlString[i]; // Add the closing '>'
                i++;
            }
            tokens.push({ type: 'tag', val: tag });
        } else if (htmlString[i] === '&') {
            let entity = '';
            while (i < htmlString.length && htmlString[i] !== ';') {
                entity += htmlString[i];
                i++;
            }
            if (i < htmlString.length) {
                entity += htmlString[i]; // Add the closing ';'
                i++;
            }
            tokens.push({ type: 'char', val: entity });
        } else {
            tokens.push({ type: 'char', val: htmlString[i] });
            i++;
        }
    }

    let tokenIndex = 0;
    let currentHtml = "";
    
    // Cursor position tracking
    let line = 1;
    let col = 1;
    let totalLinesGenerated = 0;

    // Add initial line number
    const addLineNumber = () => {
        totalLinesGenerated++;
        const span = document.createElement("span");
        span.textContent = totalLinesGenerated;
        lineNumbers.appendChild(span);
    };
    addLineNumber();

    const updateStatusBar = () => {
        if (cursorPosEl) {
            cursorPosEl.textContent = `${line},${col}`;
        }
    };

    const typeToken = () => {
        if (tokenIndex >= tokens.length) {
            // Typing complete, add blinking cursor
            typedContent.innerHTML = currentHtml + '<span class="cursor"></span>';
            return;
        }

        const token = tokens[tokenIndex];

        if (token.type === 'tag') {
            // Instantly add tags
            currentHtml += token.val;
            tokenIndex++;
            typeToken(); // Process next token immediately
            return;
        } else {
            // It's a character
            currentHtml += token.val;
            
            if (token.val === '\n') {
                line++;
                col = 1;
                addLineNumber();
            } else {
                col++;
            }
            
            // Add a temporary cursor while typing
            typedContent.innerHTML = currentHtml + '<span class="cursor"></span>';
            updateStatusBar();

            // Auto-scroll to bottom of editor
            const vimEditor = document.querySelector('.vim-editor');
            if (vimEditor) {
                vimEditor.scrollTop = vimEditor.scrollHeight;
            }

            tokenIndex++;
            
            // Variable typing speed
            const typingSpeed = token.val === '\n' ? 100 : (Math.random() * 20 + 10);
            setTimeout(typeToken, typingSpeed);
        }
    };

    // Start typing animation
    setTimeout(typeToken, 500); // initial delay
});
