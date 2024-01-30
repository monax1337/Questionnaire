// import {SocketAction, SocketState} from '../types/socketTypes';
//
// const initialState: SocketState = {
//     socket: null
// };
//
// const socketReducer = (
//     state = initialState,
//     action: SocketAction
// ): SocketState => {
//     switch (action.type) {
//         case 'SOCKET_OPEN':
//             return {
//                 ...state,
//                 socket: action.payload
//             };
//
//         case 'SOCKET_CLOSE':
//             return initialState;
//
//         case 'SOCKET_MESSAGE':
//             return {
//                 ...state,
//                 lastMessage: action.payload.message
//             }
//
//         default:
//             return state;
//     }
// }
//
// export default {
//     reducer: socketReducer,
//     name: 'socket',
//     initialState
// }

export {}