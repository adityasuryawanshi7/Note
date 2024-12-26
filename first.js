  // Define the password
        const correctPassword = "kajalverma07"; // Change this to your desired password

        // Function to check password
        function checkPassword() {
            const enteredPassword = prompt("Please enter the password:");

            if (enteredPassword === correctPassword) {
                document.getElementById("content").style.display = "block"; // Show the content if password is correct
            } else {
                alert("Incorrect password! You will be redirected.");
                window.location.href = "https://adityasuryawanshi7.github.io/enotes/"; // Redirect to another page on incorrect password
            }
        }

        // Call the function on page load
        window.onload = checkPassword;


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
    saveAccount(username); // Save the account to the accounts list
    localStorage.setItem('currentUser', currentUser); // Save the current user
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    loadNotes(); // Load notes for the logged-in user
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('mainApp').style.display = 'none';
    showNotification("Logged out!");
    loadAccounts(); // Reload accounts list
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
            <span ondblclick="editNote(${index}, this)">${note}</span>
            <div class="action-btn">
                <button class="delete-btn" onclick="confirmDelete(${index})">✗</button>
                <button class="drag-handle">☰</button>
            </div>`;
        notesList.appendChild(noteEl);
    });

    initializeSortable();
}

function editNote(index, spanElement) {
    const notes = JSON.parse(localStorage.getItem(`notes_${currentUser}`)) || [];
    const currentText = notes[index];

    // Replace the span element with an input field
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.className = 'edit-note-input';

    // Replace the span with the input field
    spanElement.replaceWith(input);

    // Focus the input field
    input.focus();

    // Save changes on blur or pressing Enter
    const saveChanges = () => {
        const updatedText = input.value.trim();
        if (updatedText) {
            notes[index] = updatedText;
            localStorage.setItem(`notes_${currentUser}`, JSON.stringify(notes));
            loadNotes();
            showNotification("Note updated!");
        } else {
            alert("Note cannot be empty.");
        }
    };

    input.addEventListener('blur', saveChanges);
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            saveChanges();
        }
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

function exportNotes() {
    const notes = JSON.parse(localStorage.getItem(`notes_${currentUser}`)) || [];
    const blob = new Blob([JSON.stringify(notes)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${currentUser}_notes.json`;
    link.click();
    showNotification("Notes exported!");
}

function importNotes(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const importedNotes = JSON.parse(e.target.result);
            localStorage.setItem(`notes_${currentUser}`, JSON.stringify(importedNotes));
            loadNotes();
            showNotification("Notes imported!");
        };
        reader.readAsText(file);
    }
}

function initializeSortable() {
    const notesList = document.getElementById('notesList');
    if (notesList.sortableInstance) {
        notesList.sortableInstance.destroy();
    }

    notesList.sortableInstance = new Sortable(notesList, {
        handle: '.drag-handle',
        animation: 150,
        onEnd: (evt) => {
            const notes = JSON.parse(localStorage.getItem(`notes_${currentUser}`)) || [];
            const [movedItem] = notes.splice(evt.oldIndex, 1);
            notes.splice(evt.newIndex, 0, movedItem);
            localStorage.setItem(`notes_${currentUser}`, JSON.stringify(notes));
            showNotification("Notes reordered!");
        }
    });
}

function checkLoginStatus() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = savedUser;
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        loadNotes();
    } else {
        document.getElementById('loginSection').style.display = 'block';
        document.getElementById('mainApp').style.display = 'none';
        loadAccounts(); // Load existing accounts on login page
    }
}

/* Account Management */
function saveAccount(username) {
    const accounts = JSON.parse(localStorage.getItem('accounts')) || [];
    if (!accounts.includes(username)) {
        accounts.push(username);
        localStorage.setItem('accounts', JSON.stringify(accounts));
        loadAccounts(); // Refresh the accounts list on the login page
    }
}

function loadAccounts() {
    const accounts = JSON.parse(localStorage.getItem('accounts')) || [];
    const accountsList = document.getElementById('accountsList');
    accountsList.innerHTML = accounts.length
        ? accounts
              .map(
                  (account, index) =>
                      `<li data-username="${account}">
                          ${account}
                          <button class="delete-account-btn" onclick="confirmDeleteAccount(${index})">✗</button>
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

// Function to login with a selected account
function loginWithAccount(username) {
    currentUser = username;
    localStorage.setItem('currentUser', currentUser); // Save the current user
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    loadNotes(); // Load notes for the selected user
}

// Add click event listeners to accounts
document.getElementById('accountsList').addEventListener('click', (event) => {
    const target = event.target.closest('li');
    if (target && target.dataset.username) {
        loginWithAccount(target.dataset.username);
    }
});






// Initialize app
document.addEventListener('DOMContentLoaded', checkLoginStatus);
