let currentUser = null;

// Utility function to show notifications
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.opacity = 1;
    setTimeout(() => {
        notification.style.opacity = 0;
    }, 2000);
}

// Login functionality
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
    loadImages();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('mainApp').style.display = 'none';
    showNotification("Logged out!");
    loadAccounts();
}

// Manage accounts
function saveAccount(username) {
    const accounts = JSON.parse(localStorage.getItem('accounts')) || [];
    if (!accounts.includes(username)) {
        accounts.push(username);
        localStorage.setItem('accounts', JSON.stringify(accounts));
    }
}

// Helper function to log in directly by username
function loginByUsername(username) {
    currentUser = username;
    localStorage.setItem('currentUser', currentUser);
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    loadNotes();
    loadImages();
    showNotification(`Logged in as ${username}`);
}

// Modified loadAccounts function to add click-to-login functionality
function loadAccounts() {
    const accounts = JSON.parse(localStorage.getItem('accounts')) || [];
    const accountsList = document.getElementById('accountsList');
    accountsList.innerHTML = ''; // Clear previous list
    accounts.forEach((account) => {
        const li = document.createElement('li');
        li.textContent = account;

        // Add event listener to log in when username is clicked
        li.addEventListener('click', () => loginByUsername(account));

        // Add delete button next to each account
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering login on delete click
            deleteAccount(account);
        });

        li.appendChild(deleteBtn);
        accountsList.appendChild(li);
    });
}

// Function to delete an account with confirmation
function deleteAccount(account) {
    const userConfirmed = confirm(`Are you sure you want to delete the account: ${account}?`);
    if (userConfirmed) {
        const accounts = JSON.parse(localStorage.getItem('accounts')) || [];
        const updatedAccounts = accounts.filter((savedAccount) => savedAccount !== account);
        localStorage.setItem('accounts', JSON.stringify(updatedAccounts));
        loadAccounts();
        console.log(`Account ${account} deleted successfully.`);
    } else {
        console.log(`Account ${account} deletion canceled.`);
    }
}

// Notes Management
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
                <button class="edit-btn" onclick="editNotePrompt(${index})">🖋️</button>
                <button class="delete-btn" onclick="deleteNotePrompt(${index})">✗</button>`;
        notesList.appendChild(noteEl);
        enableDrag(noteEl, index);
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

function editNotePrompt(index) {
    const notes = JSON.parse(localStorage.getItem(`notes_${currentUser}`)) || [];
    const newText = prompt("Edit Note:", notes[index]);
    if (newText !== null) {
        notes[index] = newText;
        localStorage.setItem(`notes_${currentUser}`, JSON.stringify(notes));
        loadNotes();
        showNotification("Note edited!");
    }
}

function deleteNotePrompt(index) {
    if (confirm("Are you sure you want to delete this note?")) {
        const notes = JSON.parse(localStorage.getItem(`notes_${currentUser}`)) || [];
        notes.splice(index, 1);
        localStorage.setItem(`notes_${currentUser}`, JSON.stringify(notes));
        loadNotes();
        showNotification("Note deleted!");
    }
}



// Export and Import Notes
function exportNotes() {
    const notes = JSON.parse(localStorage.getItem(`notes_${currentUser}`)) || [];
    const blob = new Blob([JSON.stringify(notes)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `notes_${currentUser}.json`;
    a.click();
}

function importNotes(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const importedNotes = JSON.parse(e.target.result);
        localStorage.setItem(`notes_${currentUser}`, JSON.stringify(importedNotes));
        loadNotes();
        showNotification("Notes imported!");
    };
    reader.readAsText(file);
}

// Image Management
function loadImages() {
    const imageContainer = document.getElementById('imageContainer');
    const images = JSON.parse(localStorage.getItem(`images_${currentUser}`)) || [];
    imageContainer.innerHTML = ''; // Clear previous images

    images.forEach((url) => {
        const img = document.createElement('img');
        img.src = url;
        img.style.width = '100px';
        img.style.margin = '5px';

        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.appendChild(img);

        imageContainer.appendChild(link);
    });
}

function uploadImages() {
    const imageInput = document.getElementById('uploadImage');
    const files = Array.from(imageInput.files);
    if (files.length === 0) {
        alert("No files selected.");
        return;
    }

    const images = JSON.parse(localStorage.getItem(`images_${currentUser}`)) || [];
    files.forEach((file) => {
        const imageUrl = URL.createObjectURL(file);
        images.push(imageUrl);
        localStorage.setItem(`images_${currentUser}`, JSON.stringify(images));
    });

    loadImages();
    showNotification("Images uploaded!");
}

// Initialize
window.onload = () => {
    currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        loadNotes();
        loadImages();
    } else {
        document.getElementById('loginSection').style.display = 'block';
        document.getElementById('mainApp').style.display = 'none';
    }
    loadAccounts();
};