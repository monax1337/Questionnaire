import * as React from 'react';
import MyAppBar from "../Components/UI/AppBars/MyAppBar";
import {Container} from "@mui/material";
import Grid from "@mui/material/Grid";
import MyCard from "../Components/UI/Cards/MyCard";
import Typography from "@mui/material/Typography";

interface QuestionnairesData {
    name: string;
    id: number;
}

const Questionnaires = () => {
    const questionnaires: QuestionnairesData[] = [{name: "Анкета", id: 1}, {name: "Анкета", id: 2}, {name: "Анкета", id: 3}, {name: "Анкета", id: 4}];

    return (
        <div>
            <MyAppBar navItems={['Выйти']}/>
            <Container
                sx={{mt: 3}}

            >
                <Typography textAlign="center" variant='h4'>
                    Доступные анкеты:
                </Typography>
                <Grid container justifyContent="center">
                    {questionnaires.map(questionnaire => (
                        <Grid item xs={12} key={questionnaire.id}>
                            <MyCard name={questionnaire.name}/>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </div>
    );
};

export default Questionnaires;