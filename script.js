document.addEventListener('DOMContentLoaded', () => {
    const addNoteButton = document.getElementById('addNote');
    const changeColorInput = document.getElementById('changeColor');
    const changeFontSelect = document.getElementById('changeFont');
    const notesContainer = document.getElementById('notesContainer');
    const fontSizeSelect = document.getElementById('fontSize');
    let selectedNote = null;

    loadNotes();

    addNoteButton.addEventListener('click', () => createNote());
    changeColorInput.addEventListener('input', (e) => {
        changeColor(e.target.value);
        saveNotes(); // Save note color immediately
    });
    changeFontSelect.addEventListener('change', () => {
        const selectedFont = changeFontSelect.value;
        if (selectedFont === 'Other...') {
            changeFont();
        } else if (selectedFont) {
            applyFont(selectedFont);
        }
        saveNotes();
    });
    
    fontSizeSelect.addEventListener('change', () => {
        applyFontSize(fontSizeSelect.value);
        saveNotes();
    });

    function createNote(content = '', posX = 100, posY = 100, bgColor = 'yellow', fontFamily = 'Arial', fontSize = '14px') {
        const note = document.createElement('div');
        note.classList.add('note');
        note.style.position = 'absolute';
        note.style.left = posX + 'px';
        note.style.top = posY + 'px';
        note.style.backgroundColor = bgColor;
        note.style.fontFamily = fontFamily;
        note.style.fontSize = fontSize;
        note.innerHTML = `
            <div class="content" contenteditable="true">${content}</div>
            <span class="delete">X</span>
            <div class="resize-handle"></div>
        `;
        notesContainer.appendChild(note);

        note.querySelector('.content').addEventListener('input', () => saveNotes());
        note.querySelector('.delete').addEventListener('click', () => {
            note.remove();
            saveNotes();
        });
        note.addEventListener('mousedown', startDrag);
        note.querySelector('.resize-handle').addEventListener('mousedown', startResize);
        note.addEventListener('click', () => selectedNote = note);
    }

    function saveNotes() {
        const notesData = [];
        document.querySelectorAll('.note').forEach(note => {
            const content = note.querySelector('.content').innerHTML;
            const rect = note.getBoundingClientRect();
            notesData.push({ 
                content, 
                x: rect.left, 
                y: rect.top,
                bgColor: note.style.backgroundColor,
                fontFamily: note.style.fontFamily,
                fontSize: note.style.fontSize
            });
        });
        localStorage.setItem('stickyNotes', JSON.stringify(notesData));
    }

    function loadNotes() {
        const notesData = JSON.parse(localStorage.getItem('stickyNotes'));
        if (notesData) {
            notesData.forEach(noteData => {
                createNote(
                    noteData.content, 
                    noteData.x, 
                    noteData.y, 
                    noteData.bgColor, 
                    noteData.fontFamily, 
                    noteData.fontSize
                );
            });
        }
    }

    function applyFontSize(size) {
        if (selectedNote) {
            selectedNote.style.fontSize = size;
            saveNotes();
        }
    }

    function changeColor(color) {
        if (selectedNote) {
            selectedNote.style.backgroundColor = color;
            saveNotes();
        }
    }

    function changeFont() {
        const font = prompt("Enter a font family (e.g., Arial, Verdana):", "Arial");
        if (font) {
            applyFont(font);
            saveNotes();
        }
    }

    function applyFont(font) {
        if (selectedNote) {
            selectedNote.style.fontFamily = font;
            saveNotes();
        }
    }

    function startDrag(e) {
        if (e.target.className !== 'resize-handle') {
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