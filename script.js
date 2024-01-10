document.addEventListener('DOMContentLoaded', () => {
    const addNoteButton = document.getElementById('addNote');
    const changeColorInput = document.getElementById('changeColor');
    const changeFontSelect = document.getElementById('changeFont');
    const notesContainer = document.getElementById('notesContainer');
    const fontSizeSelect = document.getElementById('fontSize');
    let selectedNote = null;

    addNoteButton.addEventListener('click', () => createNote());
    changeColorInput.addEventListener('input', (e) => changeColor(e.target.value));
    fontSizeSelect.addEventListener('change', () => {
        applyFontSize(fontSizeSelect.value);
    });
    changeFontSelect.addEventListener('change', () => {
        const selectedFont = changeFontSelect.value;
        if (selectedFont === 'Other...') {
            changeFont();
        } else if (selectedFont) {
            applyFont(selectedFont);
        }
    });

    
    function createNote() {
        const note = document.createElement('div');
        note.classList.add('note');
        note.style.position = 'absolute';
        note.innerHTML = `
            <div class="content" contenteditable="true"></div>
            <span class="delete">X</span>
            <div class="resize-handle"></div>
        `;
        notesContainer.appendChild(note);

        const deleteButton = note.querySelector('.delete');
        deleteButton.addEventListener('click', () => note.remove());

        // Drag functionality
        note.addEventListener('mousedown', startDrag);

        // Resize functionality
        const resizeHandle = note.querySelector('.resize-handle');
        const contentDiv = note.querySelector('.content');

        resizeHandle.addEventListener('mousedown', startResize);
        contentDiv.addEventListener('mouseup', () => applySelectedFontSize(contentDiv));


        

        note.addEventListener('click', () => selectedNote = note);
        note.querySelector('textarea').addEventListener('input', handleMarkdown);
    }

    function applyFontSize(size) {
        fontSizeSelect.dataset.size = size; // Store selected font size in data attribute
    }

    function applySelectedFontSize(contentDiv) {
        const size = fontSizeSelect.dataset.size;
        if (size && document.getSelection().toString()) {
            document.execCommand('fontSize', false, '7'); // Temporary font size
            const fontElements = contentDiv.querySelectorAll('font[size="7"]');
            for (let fontElem of fontElements) {
                fontElem.removeAttribute('size');
                fontElem.style.fontSize = size;
            }
        }
    }

    function wrapSelectedText(textarea, size) {
        const text = textarea.value;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = text.substring(start, end);
        const beforeText = text.substring(0, start);
        const afterText = text.substring(end);

        // Wrap the selected text in a span with the chosen font size
        textarea.value = `${beforeText}<span style="font-size: ${size};">${selectedText}</span>${afterText}`;
    }

    function startDrag(e) {
        if (e.target.tagName !== 'TEXTAREA' && e.target.className !== 'resize-handle') {
            const note = e.target.closest('.note');
            let offsetX = e.clientX - note.getBoundingClientRect().left;
            let offsetY = e.clientY - note.getBoundingClientRect().top;

            const drag = (e) => {
                note.style.left = (e.clientX - offsetX) + 'px';
                note.style.top = (e.clientY - offsetY) + 'px';
            };

            const stopDrag = () => {
                document.removeEventListener('mousemove', drag);
                document.removeEventListener('mouseup', stopDrag);
            };

            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', stopDrag);
        }
    }

    function changeColor(color) {
        if (selectedNote) {
            selectedNote.style.backgroundColor = color;
        }
    }

    function changeFont() {
        const font = prompt("Enter a font family (e.g., Arial, Verdana):", "Arial");
        if (font) {
            applyFont(font);
        }
    }

    function applyFont(font) {
        if (selectedNote) {
            selectedNote.style.fontFamily = font;
        }
    }

    function handleMarkdown(e) {
        const text = e.target.value;
        e.target.innerHTML = text
            .replace(/\*\*(.*?)\*\*/gm, '<span class="bold">$1</span>')
            .replace(/\*(.*?)\*/gm, '<span class="italic">$1</span>');
    }

    function startResize(e) {
        e.stopPropagation();
        const note = e.target.closest('.note');
        let startX = e.clientX;
        let startY = e.clientY;
        let startWidth = note.offsetWidth;
        let startHeight = note.offsetHeight;

        const resize = (e) => {
            note.style.width = startWidth + e.clientX - startX + 'px';
            note.style.height = startHeight + e.clientY - startY + 'px';
        };

        const stopResize = () => {
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('mouseup', stopResize);
        };

        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
    }
});