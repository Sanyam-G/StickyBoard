document.addEventListener('DOMContentLoaded', () => {
    const addNoteButton = document.getElementById('addNote');
    const changeColorInput = document.getElementById('changeColor');
    const changeFontSelect = document.getElementById('changeFont');
    const notesContainer = document.getElementById('notesContainer');
    let selectedNote = null;

    addNoteButton.addEventListener('click', () => createNote());
    changeColorInput.addEventListener('input', (e) => changeColor(e.target.value));
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
            <textarea></textarea>
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
        resizeHandle.addEventListener('mousedown', startResize);

        note.addEventListener('click', () => selectedNote = note);
        note.querySelector('textarea').addEventListener('input', handleMarkdown);
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
