// import { configureStore } from '@reduxjs/toolkit';
// import socketReducer from './reducers/socketReducer';
// import { socketOpen, socketClose, socketMessage } from './actions/socketActions';
//
// const store = configureStore({
//     reducer: {
//         socket: socketReducer.reducer
//     } as any,
// } as any) as ReturnType<typeof configureStore>;
//
// const socketId = "ws://localhost:8080";
// const socket = new WebSocket("ws://localhost:8080");
//
// socket.onopen = () => {
//     store.dispatch(socketOpen(socket))
// };
//
// socket.onclose = () => {
//     store.dispatch(socketClose());
// };
//
// socket.onmessage = (msg) => {
//     store.dispatch(socketMessage(socket));
// };
//
// export {
//     store
// }

export {}