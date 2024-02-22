import React, { FC, ReactNode, useEffect, useState } from 'react';
import './MyModal.css';
import { Checkbox, TextField } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";

interface IMyModalProps {
    visible: boolean;
    setVisible(visible: boolean): void;
    create: () => void; // Добавляем проп create для передачи функции из QuestionnaireForm
}

const MyModal: FC<IMyModalProps> = ({ visible, setVisible, create }) => {
    const rootClasses = ['myModal'];
    const [checked, setChecked] = useState(true);
    const [showAnswer, setShowAnswer] = useState(false);
    const [fields, setFields] = useState<string[]>(['']); // Значения текстовых полей
    const [isFieldEmpty, setIsFieldEmpty] = useState<boolean[]>([true]); // Состояние пустоты полей

    useEffect(() => {
        setChecked(false);
    }, []);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setChecked(event.target.checked);
        setShowAnswer(event.target.checked);
    };

    const handleFieldChange = (index: number, value: string) => {
        const newFields = [...fields];
        newFields[index] = value;
        setFields(newFields);

        const newIsFieldEmpty = [...isFieldEmpty];
        newIsFieldEmpty[index] = value.trim() === '';
        setIsFieldEmpty(newIsFieldEmpty);
    };

    if (visible) {
        rootClasses.push('active');
    }

    const addAnswer = () => {
        setFields(prevFields => [...prevFields, '']);
        setIsFieldEmpty(prevIsFieldEmpty => [...prevIsFieldEmpty, true]);
    };

    const deleteAnswer = (indexToDelete: number) => {
        if (fields.length > 1) {
            setFields(prevFields => prevFields.filter((_, index) => index !== indexToDelete));
            setIsFieldEmpty(prevIsFieldEmpty => prevIsFieldEmpty.filter((_, index) => index !== indexToDelete));
        }
    };

    return (
        <div className={rootClasses.join(' ')}>
            <div className='myModalContent' onClick={(e) => e.stopPropagation()}>
                <div className="numberOfQuestion">
                    <h4 style={{ width: 250 }}>Введите количество вопросов</h4>
                    <TextField
                        id="standard-number"
                        type="number"
                        sx={{ marginLeft: '50px', width: '60px' }}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        variant="standard"
                    />
                </div>

                <div className="checkBox">
                    <h4 style={{ width: 250 }}>Одни ответы на все вопросы </h4>
                    <Checkbox
                        checked={checked}
                        onChange={handleChange}
                        sx={{ marginLeft: '60px', }}
                        inputProps={{ 'aria-label': 'controlled' }}
                    />
                </div>

                {showAnswer && (
                    <div className="textFields">
                        {fields.map((value, index) => (
                            <div className="field" key={index}>
                                <TextField
                                    id={`standard-basic-${index}`}
                                    variant="standard"
                                    onChange={(e) => handleFieldChange(index, e.target.value)}
                                    value={value}
                                />
                                <IconButton aria-label="delete" onClick={() => deleteAnswer(index)} disabled={fields.length === 1}>
                                    <DeleteIcon />
                                </IconButton>
                            </div>
                        ))}
                        <Button color="secondary" onClick={addAnswer}>Добавить ответ</Button>
                    </div>
                )}
                <div style={{display:"flex", alignItems: "center",justifyContent: "center"}}>
                    <Button onClick={create}  color="secondary" disabled={showAnswer && isFieldEmpty.some(isEmpty => isEmpty)} >Начать создание</Button>
                </div>
            </div>
        </div>
);
};

export default MyModal;