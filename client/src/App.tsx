import React from 'react';
import {ThemeProvider} from "@mui/material";
import {theme} from "./Theme/theme";
import {BrowserRouter} from "react-router-dom";
import AppRouter from "./Components/AppRouter";
import {Provider} from "react-redux";
// import {store} from "./store";

const App = () => {
    return (
        // <Provider store={store}>
            <ThemeProvider theme={theme}>
                <BrowserRouter>
                    <AppRouter />
                </BrowserRouter>
            </ThemeProvider>
        // </Provider>
    );
};

export default App;