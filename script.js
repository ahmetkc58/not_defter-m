const noteInput = document.getElementById('noteInput');
const noteImage = document.getElementById('noteImage');
const noteLink = document.getElementById('noteLink');
const noteList = document.getElementById('noteList');
const addImageButton = document.getElementById('addImageButton');
const selectImageFile = document.getElementById('selectImageFile');
const enterImageUrl = document.getElementById('enterImageUrl');
let notes = JSON.parse(localStorage.getItem('notes')) || [];

// Sayfa yüklendiğinde tamamlanmayan notları göster
window.onload = () => {
    displayNotes('incomplete');
};

// Enter tuşuna basıldığında not ekle
noteInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        addNote();
    }
});

// Yeni not ekle
function addNote() {
    const noteText = noteInput.value.trim();
    if (!noteText) {
        alert("Lütfen bir not girin!");
        return;
    }

    const file = noteImage.files[0]; // Seçilen fotoğraf
    if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            saveNote(noteText, reader.result); // Base64 formatındaki görseli kaydet
        };
        reader.onerror = function () {
            alert("Görsel yüklenirken bir hata oluştu.");
        };
    } else {
        saveNote(noteText, noteLink.value.trim()); // Fotoğraf yoksa linki kaydet
    }
}

// Notu kaydet ve ekrana yazdır
function saveNote(text, image) {
    const newNote = {
        id: Date.now().toString(),
        text: text,
        image: image,
        completed: false,
        dateAdded: new Date().toLocaleString()
    };

    notes.unshift(newNote);
    noteInput.value = '';
    noteImage.value = '';
    noteLink.value = '';
    saveNotes();
    displayNotes('incomplete');
}

// Notları ekrana yazdır
function displayNotes(filterType = 'incomplete') {
    noteList.innerHTML = '';

    const filteredNotes = notes.filter(note => {
        if (filterType === 'completed') return note.completed;
        if (filterType === 'incomplete') return !note.completed;
        return true;
    });

    filteredNotes.forEach(note => {
        const noteItem = createNoteItem(note);
        noteList.appendChild(noteItem);
    });

    updateNoteCounter();
}

// Not kartı oluşturma fonksiyonu
function createNoteItem(note) {
    const noteItem = document.createElement('div');
    noteItem.classList.add('note-card');
    if (note.completed) noteItem.classList.add('completed');

    let imageHTML = '';
    if (note.image && note.image.startsWith('http')) {
        imageHTML = `<a href="${note.image}" target="_blank"><img src="${note.image}" class="note-image" alt="Not Görseli"></a>`;
    } else if (note.image) {
        imageHTML = `<img src="${note.image}" class="note-image" alt="Not Görseli">`;
    }

    noteItem.innerHTML = `
        ${imageHTML}
        <p class="note-text">${note.text}</p>
        <small class="note-date">${note.dateAdded}</small>
        <div class="note-buttons">
            <button class="complete" onclick="toggleComplete('${note.id}')">
                ${note.completed ? 'Geri Al' : 'Tamamla'}
            </button>
            <button class="delete" onclick="deleteNote('${note.id}')"> Sil</button>
            <button class="edit" onclick="editNote('${note.id}')">✎ Düzenle</button>
        </div>
    `;

    // Resim varsa tıklama olayını ekle
    const imageElement = noteItem.querySelector('.note-image');
    if (imageElement) {
        imageElement.addEventListener('click', () => {
            openModal(note.image);
        });
    }

    return noteItem;
}

// Notları kaydet
function saveNotes() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

// Notu tamamla/geri al
function toggleComplete(id) {
    notes.forEach(note => {
        if (note.id === id) {
            note.completed = !note.completed;
        }
    });
    saveNotes();
    displayNotes();
}

// Notu sil
function deleteNote(id) {
    if (confirm("Notu silmek istediğinize emin misiniz?")) {
        notes = notes.filter(note => note.id !== id);
        saveNotes();
        displayNotes();
    }
}

// Notu düzenle
function editNote(id) {
    const noteToEdit = notes.find(note => note.id === id);
    if (noteToEdit) {
        noteInput.value = noteToEdit.text;
        noteImage.value = '';
        noteLink.value = noteToEdit.image && noteToEdit.image.startsWith('http') ? noteToEdit.image : '';
        notes = notes.filter(note => note.id !== id);
        saveNotes();
        displayNotes();
    }
}

// Tüm notları temizle
function clearAllNotes() {
    if (confirm("Tüm notları silmek istediğinize emin misiniz?")) {
        notes = [];
        saveNotes();
        displayNotes();
    }
}

// "Resim Seç" butonuna tıklanınca dosya seçme penceresini aç
selectImageFile.addEventListener('click', () => {
    noteImage.click();
});

// "Link Gir" butonuna tıklanınca link girişini göster
enterImageUrl.addEventListener('click', () => {
    noteLink.style.display = 'block';
    noteLink.focus();
});

// Link girişinden çıkıldığında (blur)
noteLink.addEventListener('blur', () => {
    noteLink.style.display = 'none';
    const imageUrl = noteLink.value.trim();
    if (imageUrl) {
        saveNote(noteInput.value, imageUrl);
        noteLink.value = '';
    }
});

// Büyütülmüş resim modalını aç
function openModal(imageSrc) {
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
        <span class="close">&times;</span>
        <img class="modal-content" src="${imageSrc}">
    `;
    document.body.appendChild(modal);

    const closeButton = modal.querySelector('.close');
    closeButton.onclick = () => {
        document.body.removeChild(modal);
    };

    modal.onclick = (event) => {
        if (event.target === modal) {
            document.body.removeChild(modal);
        }
    };
}