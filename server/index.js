const WebSocket = require('ws');

const port = process.env.PORT || 8080;
const server = new WebSocket.Server({ port });


let users = {};

server.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('message', (message) => {
        const data = JSON.parse(message);

        switch (data.type) {
            case 'login':
                if (users[data.username]) {
                    socket.send(JSON.stringify({ type: 'login', success: false }));
                } else {
                    users[data.username] = socket;
                    socket.username = data.username;
                    socket.send(JSON.stringify({ type: 'login', success: true }));
                }
                break;
            case 'chat':
                Object.values(users).forEach(userSocket => {
                    if (userSocket !== socket) {
                        userSocket.send(JSON.stringify({ type: 'chat', text: data.text, username: data.username }));
                    }
                });
                break;
        }
    });

    socket.on('close', () => {
        if (socket.username) {
            delete users[socket.username];
            console.log(`User ${socket.username} disconnected`);
        }
    });
});

console.log(`Server started on port ${port}`);
