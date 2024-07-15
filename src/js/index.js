import '../css/styles.css';

const socket = new WebSocket('ws://localhost:3000');

const loginForm = document.getElementById('loginForm');
const chatForm = document.getElementById('chatForm');
const messages = document.getElementById('messages');
const usersList = document.getElementById('usersList');
const nameInput = document.getElementById('nameInput');
const messageInput = document.getElementById('messageInput');

let userName = '';

socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);

    switch (msg.type) {
        case 'nameError':
            alert(msg.error);
            break;
        case 'nameAccepted':
            userName = msg.name;
            loginForm.style.display = 'none';
            chatForm.style.display = 'block';
            break;
        case 'message':
            addMessage(msg.name, msg.text);
            break;
        case 'users':
            updateUsersList(msg.users);
            break;
    }
};

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    socket.send(JSON.stringify({ type: 'setName', name: nameInput.value }));
});

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    socket.send(JSON.stringify({ type: 'message', text: messageInput.value }));
    addMessage('You', messageInput.value);
    messageInput.value = '';
});

const addMessage = (name, text) => {
    const messageElement = document.createElement('div');
    messageElement.className = name === 'You' ? 'my-message' : 'other-message';
    messageElement.textContent = `${name}: ${text}`;
    messages.appendChild(messageElement);
};

const updateUsersList = (users) => {
    usersList.innerHTML = '';
    users.forEach(user => {
        const userElement = document.createElement('div');
        userElement.textContent = user;
        usersList.appendChild(userElement);
    });
};
