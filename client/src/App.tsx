import React from 'react';
import {ThemeProvider} from "@mui/material";
import {theme} from "./Theme/theme";
import {BrowserRouter} from "react-router-dom";
import AppRouter from "./Components/AppRouter";
import {WebSocketProvider} from "./Contexts/WebSocketContext";

const App = () => {
    return (
        <WebSocketProvider>
            <ThemeProvider theme={theme}>
                <BrowserRouter>
                    <AppRouter/>
                </BrowserRouter>
            </ThemeProvider>
        </WebSocketProvider>
    );
};

export default App;