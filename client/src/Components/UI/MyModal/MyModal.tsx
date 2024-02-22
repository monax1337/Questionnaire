import React, {FC, ReactNode, useEffect, useState} from 'react';
import './MyModal.css';
import {Checkbox, TextField} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
interface IMyModalProps {
    visible: boolean;
    setVisible(visible: boolean): void;
    children: ReactNode;
}

const MyModal: FC<IMyModalProps> = ({ visible, setVisible,children }) => {
    const rootClasses = ['myModal'];
    const [checked, setChecked] = React.useState(true);
    const [showAnswer,setShowAnswer]=useState(false)
    const [fields, setFields] = useState([1, 2, 3, 4]);
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setChecked(event.target.checked);
        setShowAnswer(event.target.checked);
    };
    if (visible) {
        rootClasses.push('active');
    }
    useEffect(()=>{
        setChecked(false);
    },[])
    const addAnswer = () => {
        setFields(prevFields => [...prevFields, prevFields.length + 1]);
    };
    const deleteAnswer = (indexToDelete: any) => {
        if (fields.length > 1) {
            setFields(prevFields => prevFields.filter((_, index) => index !== indexToDelete));
        }
    };
    return (
        <div className={rootClasses.join(' ')}>
            <div className='myModalContent' onClick={(e) => e.stopPropagation()}>
                <div className="numberOfQuestion">
                    <h4 style={{width:250}}>Введите количество вопросов</h4>
                    <TextField
                        id="standard-number"
                        type="number"
                        sx={{ marginLeft:'50px', width: '60px' }}
                        InputLabelProps={{
                            shrink: true,

                        }}
                        variant="standard"
                    />
                </div>

                <div className="checkBox">
                    <h4 style={{width:250}}>Одни ответы на все вопросы </h4>
                    <Checkbox
                        checked={checked}
                        onChange={handleChange}
                        sx={{ marginLeft:'60px',}}
                        inputProps={{ 'aria-label': 'controlled' }}
                    />
                </div>
                {showAnswer && ( // Показывать только если showAnswer === true
                    <div className="textFields">
                        {fields.map((value, index) => (
                            <div className="field" key={index}>
                                <TextField id={`standard-basic-${index}`} variant="standard" />
                                <IconButton aria-label="delete" onClick={() => deleteAnswer(index)} disabled={fields.length === 1}>
                                    <DeleteIcon />
                                </IconButton>
                            </div>
                        ))}
                        <Button color="secondary" onClick={addAnswer}>Добавить ответ</Button>
                    </div>
                )
                }
                {children}
            </div>
        </div>
    );
};

export default MyModal;