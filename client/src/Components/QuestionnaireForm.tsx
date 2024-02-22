import { Button } from '@mui/material';
import React, { FC } from 'react';


interface FormProps {
    create: () => void;
}

const QuestionnaireForm: FC<FormProps> = ({ create }) => {
    const addNewForm = (e: any) => {
        e.preventDefault();

        create();
    };

    return (
        <form style={{display:"flex", justifyContent:"center"}}>
            <Button onClick={addNewForm}  color="secondary">Начать создание</Button>
        </form>
    );
};

export default QuestionnaireForm;
