import React, {useEffect, useState} from 'react';
import MyAppBar from "../Components/UI/AppBars/MyAppBar";
import {Container} from "@mui/material";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import MyCard from "../Components/UI/Cards/MyCard";
import {useWebSocket} from "../Contexts/WebSocketContext";

const ProfessorQuestionnaires = () => {
    const [availableQuestionnaires, setAvailableQuestionnaires] = useState<string[]>([]);
    const {socket} = useWebSocket();
    let ProfessorName = ["Admin"];

    useEffect(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(["RequestForQuestionnairesProfessor", ProfessorName]));
        }
    }, [socket]);

    useEffect(() => {
        if (socket) {
            socket.onopen = () => {
                console.log('WebSocket connection opened.');
                socket.send(JSON.stringify(["RequestForQuestionnairesProfessor", ProfessorName]))
            };
            socket.onmessage = (event) => {
                console.log('Received message:', event.data);
                setAvailableQuestionnaires(JSON.parse(event.data)[1]);
            };
            socket.onclose = () => {
                console.log('WebSocket connection closed.');
            };
        }
    }, [socket]);

    return (
        <div>
            <MyAppBar navItems={["Выйти"]}/>
            <Container
                sx={{mt: 3}}
            >
                {(availableQuestionnaires.length)
                    ?
                    <>
                        <Typography textAlign="center" variant='h4'>
                            Доступные анкеты:
                        </Typography>
                        <Grid container justifyContent="center">
                            {availableQuestionnaires.map((questionnaire, index) => (
                                <Grid item xs={12} key={index}>
                                    <MyCard name={questionnaire}/>
                                </Grid>
                            ))}
                        </Grid>
                    </>
                    :
                    <Typography textAlign="center" variant='h4'>
                        Нет доступных анкет.
                    </Typography>
                }
            </Container>
        </div>
    );
}

export default ProfessorQuestionnaires;