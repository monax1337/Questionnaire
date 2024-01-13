import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    palette: {
        primary: {
            main: '#556cd6',
        },
        secondary: {
            main: '#19857b',
        },
    },
    typography: {
        fontFamily: '"Roboto", sans-serif',
        fontSize: 14,
        h1: {
            fontSize: '3rem',
        },
    },
});