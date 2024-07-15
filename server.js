const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let users = {};

wss.on('connection', (ws) => {
    let userName = '';

    ws.on('message', (message) => {
        const msg = JSON.parse(message);

        switch (msg.type) {
            case 'setName':
                if (Object.values(users).includes(msg.name)) {
                    ws.send(JSON.stringify({ type: 'nameError', error: 'Nickname is taken' }));
                } else {
                    userName = msg.name;
                    users[ws._socket.remoteAddress] = userName;
                    ws.send(JSON.stringify({ type: 'nameAccepted', name: userName }));
                    broadcastUsers();
                }
                break;
            case 'message':
                broadcastMessage(userName, msg.text);
                break;
        }
    });

    ws.on('close', () => {
        delete users[ws._socket.remoteAddress];
        broadcastUsers();
    });

    const broadcastMessage = (name, text) => {
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'message', name, text }));
            }
        });
    };

    const broadcastUsers = () => {
        const userList = Object.values(users);
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'users', users: userList }));
            }
        });
    };
});


app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

server.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
