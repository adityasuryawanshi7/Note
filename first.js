let currentUser = null;

// Function to display a notification
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.opacity = 1;
    setTimeout(() => (notification.style.opacity = 0), 1000);
}

// Login function
function login() {
    const username = document.getElementById('usernameInput').value.trim();
    if (!username) {
        alert("Please enter a valid username.");
        return;
    }

    currentUser = username;
    saveAccount(username);
    localStorage.setItem('currentUser', currentUser);
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    loadNotes();
    loadMedia();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('mainApp').style.display = 'none';
    showNotification("Logged out!");
    loadAccounts();
}

function loadNotes() {
    if (!currentUser) return;

    const notesList = document.getElementById('notesList');
    notesList.innerHTML = '';

    const notes = JSON.parse(localStorage.getItem(`notes_${currentUser}`)) || [];
    notes.forEach((note, index) => {
        const noteEl = document.createElement('div');
        noteEl.className = 'note';
        noteEl.innerHTML = `
            <span>${note}</span>
            <div class="action-btn">
                <button class="delete-btn" onclick="confirmDelete(${index})">✗</button>
                <button class="drag-handle">☰</button>
            </div>`;
        notesList.appendChild(noteEl);
    });
}

function saveNote() {
    const noteInput = document.getElementById('noteInput');
    const note = noteInput.value.trim();

    if (!note) {
        alert("Note cannot be empty.");
        return;
    }

    const notes = JSON.parse(localStorage.getItem(`notes_${currentUser}`)) || [];
    notes.push(note);
    localStorage.setItem(`notes_${currentUser}`, JSON.stringify(notes));
    noteInput.value = '';
    loadNotes();
    showNotification("Note saved!");
}

function confirmDelete(index) {
    if (confirm("Are you sure you want to delete this note?")) {
        deleteNote(index);
    }
}

function deleteNote(index) {
    const notes = JSON.parse(localStorage.getItem(`notes_${currentUser}`)) || [];
    notes.splice(index, 1);
    localStorage.setItem(`notes_${currentUser}`, JSON.stringify(notes));
    loadNotes();
    showNotification("Note deleted!");
}

// Load Media for current user
function loadMedia() {
    if (!currentUser) return;

    const imageContainer = document.getElementById('imageContainer');
    const audioContainer = document.getElementById('audioContainer');
    const fileContainer = document.getElementById('fileContainer');

    // Load images from localStorage
    const images = JSON.parse(localStorage.getItem(`images_${currentUser}`)) || [];
    imageContainer.innerHTML = '';
    images.forEach((image) => {
        const imgElement = document.createElement('img');
        imgElement.src = image;
        imageContainer.appendChild(imgElement);
    });

    // Load audio files from localStorage
    const audios = JSON.parse(localStorage.getItem(`audios_${currentUser}`)) || [];
    audioContainer.innerHTML = '';
    audios.forEach((audio) => {
        const audioElement = document.createElement('audio');
        audioElement.src = audio;
        audioElement.controls = true;
        audioContainer.appendChild(audioElement);
    });

    // Load other files from localStorage
    const files = JSON.parse(localStorage.getItem(`files_${currentUser}`)) || [];
    fileContainer.innerHTML = '';
    files.forEach((file) => {
        const fileElement = document.createElement('a');
        fileElement.href = file;
        fileElement.download = file;
        fileElement.textContent = 'Download File';
        fileContainer.appendChild(fileElement);
    });
}

// Handle media file uploads (Images, Audio, Files)
function handleMediaUpload(event, type) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        let mediaList = JSON.parse(localStorage.getItem(`${type}_${currentUser}`)) || [];

        if (type === 'image') {
            mediaList.push(e.target.result);
            localStorage.setItem(`images_${currentUser}`, JSON.stringify(mediaList));
        } else if (type === 'audio') {
            mediaList.push(e.target.result);
            localStorage.setItem(`audios_${currentUser}`, JSON.stringify(mediaList));
        } else if (type === 'file') {
            mediaList.push(e.target.result);
            localStorage.setItem(`files_${currentUser}`, JSON.stringify(mediaList));
        }

        loadMedia();
        showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded!`);
    };

    if (type === 'image') {
        reader.readAsDataURL(file); // For image files
    } else {
        reader.readAsArrayBuffer(file); // For audio and other files
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = savedUser;
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        loadNotes();
        loadMedia();
    } else {
        document.getElementById('loginSection').style.display = 'block';
        document.getElementById('mainApp').style.display = 'none';
    }
});

// Save account data
function saveAccount(username) {
    const accounts = JSON.parse(localStorage.getItem('accounts')) || [];
    if (!accounts.includes(username)) {
        accounts.push(username);
        localStorage.setItem('accounts', JSON.stringify(accounts));
        loadAccounts();
    }
}

function loadAccounts() {
    const accounts = JSON.parse(localStorage.getItem('accounts')) || [];
    const accountsList = document.getElementById('accountsList');
    accountsList.innerHTML = accounts.length
        ? accounts
              .map(
                  (account, index) =>
                      `<li data-username="${account}" onclick="loginWithAccount('${account}')">
                          ${account}
                          <button class="delete-account-btn" onclick="confirmDeleteAccount(${index}); event.stopPropagation();">✗</button>
                      </li>`
              )
              .join('')
        : '<li>No accounts found.</li>';
}

function confirmDeleteAccount(index) {
    if (confirm("Are you sure you want to delete this account?")) {
        deleteAccount(index);
    }
}

function deleteAccount(index) {
    const accounts = JSON.parse(localStorage.getItem('accounts')) || [];
    accounts.splice(index, 1);
    localStorage.setItem('accounts', JSON.stringify(accounts));
    loadAccounts();
    showNotification("Account deleted!");
}

// Login with account when username is clicked
function loginWithAccount(username) {
    currentUser = username;
    localStorage.setItem('currentUser', currentUser);
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    loadNotes();
    loadMedia();
}

// Handling media uploads
document.getElementById('uploadImage').addEventListener('change', (e) => handleMediaUpload(e, 'image'));
document.getElementById('uploadAudio').addEventListener('change', (e) => handleMediaUpload(e, 'audio'));
document.getElementById('uploadFile').addEventListener('change', (e) => handleMediaUpload(e, 'file'));