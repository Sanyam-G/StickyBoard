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

    function createNote(content = '', posX = '100px', posY = '100px', bgColor = 'yellow', fontFamily = 'Arial', fontSize = '14px', width = '150px', height = '150px') {
        const note = document.createElement('div');
        note.classList.add('note');
        note.style.position = 'absolute';
        note.style.left = posX;
        note.style.top = posY;
        note.style.backgroundColor = bgColor;
        note.style.fontFamily = fontFamily;
        note.style.fontSize = fontSize;
        note.style.width = width;
        note.style.height = height;
        note.innerHTML = `
            <div class="content" contenteditable="true">${content}</div>
            <span class="delete">X</span>
            <div class="resize-handle"></div>
        `;
        notesContainer.appendChild(note);

        note.querySelector('.content').addEventListener('input', saveNotes);
        note.querySelector('.delete').addEventListener('click', () => {
            note.remove();
            saveNotes();
        });
        note.addEventListener('mousedown', startDrag);
        note.querySelector('.resize-handle').addEventListener('mousedown', (e) => startResize(e, note));
        note.addEventListener('click', () => selectedNote = note);
    }

    function saveNotes() {
        const notesData = [];
        document.querySelectorAll('.note').forEach(note => {
            const content = note.querySelector('.content').innerHTML;
            notesData.push({ 
                content, 
                x: note.style.left, 
                y: note.style.top,
                bgColor: note.style.backgroundColor,
                fontFamily: note.style.fontFamily,
                fontSize: note.style.fontSize,
                width: note.style.width,
                height: note.style.height
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
                    noteData.fontSize,
                    noteData.width,
                    noteData.height
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
            document.addEventListener('mouseup', () => {
                saveNotes(); // Save notes after dragging
            }, { once: true });
            document.addEventListener('mouseup', stopDrag);
        }
    }

    function startResize(e, note) {
        e.preventDefault();
        let startX = e.clientX;
        let startY = e.clientY;
        let startWidth = note.clientWidth;
        let startHeight = note.clientHeight;

        function resizing(e) {
            let newWidth = startWidth + e.clientX - startX;
            let newHeight = startHeight + e.clientY - startY;
            note.style.width = `${newWidth}px`;
            note.style.height = `${newHeight}px`;
        }

        function stopResize() {
            document.removeEventListener('mousemove', resizing);
            document.removeEventListener('mouseup', stopResize);
            saveNotes(); // Save notes after resizing
        }

        document.addEventListener('mousemove', resizing);
        document.addEventListener('mouseup', stopResize);
    }

    document.getElementById('exportNotes').addEventListener('click', exportNotes);
    document.getElementById('importNotes').addEventListener('change', importNotes);

    function exportNotes() {
        const notesData = JSON.stringify(JSON.parse(localStorage.getItem('stickyNotes')), null, 2);
        const blob = new Blob([notesData], { type: 'application/json' });
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = 'StickyBoard_notes.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
    }

    function importNotes(event) {
        const fileReader = new FileReader();
        fileReader.onload = (e) => {
            const notesData = JSON.parse(e.target.result);
            localStorage.setItem('stickyNotes', JSON.stringify(notesData));
            loadNotes(); // Reload the notes
        };
        fileReader.readAsText(event.target.files[0]);
    }
});