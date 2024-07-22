import './styles.css';

const socket = new WebSocket('wss://your-server-url.onrender.com');

let username = '';

window.onload = function() {
    username = prompt('Введите ваш никнейм:');
    socket.send(JSON.stringify({ type: 'login', username }));

    socket.onmessage = function(event) {
        const message = JSON.parse(event.data);
        if (message.type === 'login' && !message.success) {
            alert('Этот никнейм уже занят, попробуйте другой.');
            window.location.reload();
        } else if (message.type === 'chat') {
            const chat = document.getElementById('chat');
            chat.innerHTML += `<p><strong>${message.username}:</strong> ${message.text}</p>`;
        }
    };

    document.getElementById('sendButton').onclick = function() {
        const text = document.getElementById('messageInput').value;
        socket.send(JSON.stringify({ type: 'chat', text, username }));
        document.getElementById('messageInput').value = '';
    };
};
