import './styles.css';

const socket = new WebSocket('wss://chat-app-n0ye.onrender.com');

let username = '';

window.onload = function() {
    username = prompt('Введите ваш никнейм:');

    socket.onopen = function() {
        socket.send(JSON.stringify({ type: 'login', username }));
    };

    socket.onmessage = function(event) {
        const message = JSON.parse(event.data);

        if (message.type === 'login') {
            if (!message.success) {
                alert('Этот никнейм уже занят, попробуйте другой.');
                window.location.reload();
            }
        } else if (message.type === 'chat') {
            const chat = document.getElementById('chat');
            const isOwnMessage = message.username === username;
            const messageClass = isOwnMessage ? 'own-message' : 'other-message';
            chat.innerHTML += `
                <p class="${messageClass}">
                    <strong>${isOwnMessage ? 'You' : message.username}:</strong> ${message.text}
                </p>
            `;
            chat.scrollTop = chat.scrollHeight; 
        } else if (message.type === 'users') {
            const userList = document.getElementById('userList');
            userList.innerHTML = message.users.map(user => `<li>${user}</li>`).join('');
        }
    };

    document.getElementById('sendButton').onclick = function() {
        sendMessage();
    };

    document.getElementById('messageInput').onkeypress = function(event) {
        if (event.key === 'Enter') {
            sendMessage();
        }
    };
};

function sendMessage() {
    const text = document.getElementById('messageInput').value;
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'chat', text, username }));
        document.getElementById('messageInput').value = ''; 
    } else {
        console.error('WebSocket соединение не установлено');
    }
}
