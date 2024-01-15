import React from 'react';
import {ThemeProvider} from "@mui/material";
import {theme} from "./Theme/theme";
import {BrowserRouter} from "react-router-dom";
import AppRouter from "./Components/AppRouter";

const App = () => {
    return (
        <ThemeProvider theme={theme}>
            <BrowserRouter>
                <AppRouter />
            </BrowserRouter>
        </ThemeProvider>
    );
};

export default App;