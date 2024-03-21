import * as React from 'react';
import MyAppBar from "../Components/UI/AppBars/MyAppBar";
import {Container} from "@mui/material";
import Grid from "@mui/material/Grid";
import MyCard from "../Components/UI/Cards/MyCard";
import Typography from "@mui/material/Typography";
import {useEffect, useState} from "react";
import {useWebSocket} from "../Contexts/WebSocketContext";
import {useLocation} from "react-router-dom";

interface QuestionnairesData {
    name: string;
}

const Questionnaires: QuestionnairesData = () => {
    const [availableQuestionnaires, setAvailableQuestionnaires] = useState<string[]>([]);
    const {socket} = useWebSocket();
    const location = useLocation(); // Get location object from React Router
    const { selectedGroup } = location.state || {};
    let enteredQuestionnaire =selectedGroup.groups ;

    useEffect(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(["RequestForQuestionnaireStudent", enteredQuestionnaire]));
        }
    }, [socket]);

    useEffect(() => {
        if (socket) {
            socket.onopen = () => {
                console.log('WebSocket connection opened.');
                socket.send(JSON.stringify(["RequestForQuestionnaireStudent", enteredQuestionnaire]))
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
};

export default Questionnaires;