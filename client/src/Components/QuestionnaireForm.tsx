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
        <form>
            <Button onClick={addNewForm}>Создать пост</Button>
        </form>
    );
};

export default QuestionnaireForm;
