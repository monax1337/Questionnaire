const WebSocket = require('ws');
const http = require('http');
const mysql = require('mysql');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('Client connected');

    var con = mysql.createConnection({
        host: "localhost",
        user: "yourusername",
        password: "yourpassword",
        database: "mydb"
    });

    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected to the database!");

        // Здесь вы можете выполнить запросы к базе данных
    });

    ws.on('message', async (message) => {
        console.log(`Received: ${message}`);
        // Здесь вы можете использовать 'con' для взаимодействия с базой данных
    });

    ws.send('Welcome to the WebSocket server!');
});

server.listen(3001, () => {
    console.log('Server is listening on port 3001');
});
