import React from 'react';
import {ThemeProvider} from "@mui/material";
import {theme} from "./Theme/theme";

const App = () => {
    return (
        <ThemeProvider theme={theme}>

        </ThemeProvider>
    );
};

export default App;