// const WebSocketUrl = 'ws://localhost:8080';
//
// export function openSocket() {
//
//     const socket = new WebSocket(WebSocketUrl);
//
//     socket.onopen = () => {
//         console.log('WebSocket connection opened.');
//     };
//
//     return ;
//
// }
//
// export function sendMessage(message) {
//     const socket = new WebSocket(WebSocketUrl);
//     socket.send(JSON.stringify(message));
// }
//
// export function closeSocket(socket) {
//     socket.close();
// }