import React, { useState } from 'react';
import MyAppBar from "../Components/UI/AppBars/MyAppBar";
import MyModal from "../Components/UI/Modals/MyModal";
import { TextField, Button, IconButton, Select, MenuItem, FormControl, InputLabel, Checkbox, ListItemText } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { SelectChangeEvent } from '@mui/material';
import {useWebSocket} from "../Contexts/WebSocketContext";

const CreateQuestionnaires = () => {
    const [modal, setModal] = useState(true);
    const [questionnaire, setQuestionnaire] = useState([{ question: '', answers: ['',''] }]);
    const [formName, setFormName] = useState('');
    const [faculty, setFaculty] = useState('');
    const [groups, setGroups] = useState<string[]>([]);
    const {socket} = useWebSocket();
    // Функция для открытия/закрытия модального окна
    const toggleModal = () => {
        setModal(prevModal => !prevModal);
    };

    // Функция для добавления вопроса
    const addQuestion = () => {
        setQuestionnaire(prevQuestionnaire => [...prevQuestionnaire, { question: '', answers: ['', ''] }]);
    };

    // Функция для удаления ответа
    const deleteAnswer = (questionIndex: number, answerIndex: number) => {
        setQuestionnaire(prevQuestionnaire => {
            const newQuestionnaire = [...prevQuestionnaire];
            const question = newQuestionnaire[questionIndex];
            question.answers.splice(answerIndex, 1);
            return newQuestionnaire;
        });
    };

    // Функция для добавления ответа
    const addAnswer = (questionIndex: number) => {
        setQuestionnaire(prevQuestionnaire => {
            const newQuestionnaire = [...prevQuestionnaire];
            newQuestionnaire[questionIndex].answers.push('');
            return newQuestionnaire;
        });
    };

    // Функция для изменения текста вопроса
    const handleQuestionChange = (index: number, value: string) => {
        const newQuestionnaire = [...questionnaire];
        newQuestionnaire[index].question = value;
        setQuestionnaire(newQuestionnaire);
    };

    // Функция для изменения текста ответа
    const handleAnswerChange = (questionIndex: number, answerIndex: number, value: string) => {
        const newQuestionnaire = [...questionnaire];
        newQuestionnaire[questionIndex].answers[answerIndex] = value;
        setQuestionnaire(newQuestionnaire);
    };

    // Функция для обработки создания опросника
    const createQuestionnaire = (numberOfQuestions: string, answersArray: string[]) => {
        toggleModal(); // Закрываем модальное окно

        if(answersArray.length>1) {
            const newQuestionnaire = Array.from({length: Number(numberOfQuestions)}, (_, index) => ({
                question: `Вопрос ${index + 1}`,
                answers: answersArray.slice(), // Копируем массив ответов
            }));
            setQuestionnaire(newQuestionnaire);
        }
        else{
            const newQuestionnaire = Array.from({length: Number(numberOfQuestions)}, (_, index) => ({
                question: `Вопрос ${index + 1}`,
                answers: ['',''], // Копируем массив ответов
            }));
            setQuestionnaire(newQuestionnaire);
        }
        // Сохраняем опросник
    };

    const handleFormNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormName(e.target.value);
    };

    const handleFacultyChange = (e: SelectChangeEvent<string>) => {
        setFaculty(e.target.value);
    };

    const handleGroupsChange = (e: SelectChangeEvent<string | string[]>) => {
        setGroups(e.target.value as string[] || []);
    };

    const sendQuestionnaireData = (data:any) => {
        if(socket)
            socket.send(JSON.stringify(["ReceiveProfessorQuestionnaire",data]));
    };

    // Функция для добавления анкеты
    const addQuestionnaire = () => {
        // Собираем данные для отправки на сервер
        const data = {
            formName: formName,
            faculty: faculty,
            groups: groups,
            questionnaire: questionnaire
        };

        // Отправляем данные на сервер через WebSocket
        sendQuestionnaireData(data);
    };
    const deleteQuestion = (questionIndex: number) => {
        setQuestionnaire(prevQuestionnaire => {
            const newQuestionnaire = [...prevQuestionnaire];
            newQuestionnaire.splice(questionIndex, 1);
            return newQuestionnaire;
        });
    };

    return (
        <div>
            <MyAppBar navItems={['Выйти']} />
            <MyModal visible={modal} setVisible={toggleModal} create={createQuestionnaire} />



            <div className="allContent">
                {!modal && (
                    <div className="mainContent">
                        <div className="formControl">
                            <TextField
                                label="Название анкеты"
                                value={formName}
                                onChange={handleFormNameChange}
                                sx={{ marginLeft: '5px'}}
                            />
                            <FormControl  required style={{ maxWidth: '300px',minWidth: '300px', marginTop:'10px', marginLeft:'5px' }}>
                                <InputLabel id="faculty-select-label">Факультет</InputLabel>
                                <Select
                                    labelId="faculty-select-label"
                                    id="faculty-select"
                                    value={faculty}
                                    onChange={handleFacultyChange}
                                    style={{ width: '100%' }}
                                >
                                    <MenuItem value="faculty1">Факультет 1</MenuItem>
                                    <MenuItem value="faculty2">Факультет 2</MenuItem>
                                    <MenuItem value="faculty3">Факультет 3</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl required style={{  maxWidth: '300px',minWidth: '300px', marginTop:'10px', marginLeft:'5px' }}>
                                <InputLabel id="groups-select-label">Группы</InputLabel>
                                <Select
                                    labelId="groups-select-label"
                                    id="groups-select"
                                    multiple
                                    value={groups}
                                    onChange={handleGroupsChange}
                                    style={{ width: '100%' }}
                                    renderValue={(selected) => (selected as string[]).join(', ')}
                                >
                                    <MenuItem value="group1">Группа 1</MenuItem>
                                    <MenuItem value="group2">Группа 2</MenuItem>
                                    <MenuItem value="group3">Группа 3</MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                        <div className="questionContent">
                            {questionnaire.map((questionData, questionIndex) => (
                                <div className="question" key={questionIndex}>
                                    <TextField
                                        id={`question-${questionIndex}`}
                                        label={`Вопрос ${questionIndex + 1}`}
                                        variant="standard"
                                        value={questionData.question}
                                        onChange={(e) => handleQuestionChange(questionIndex, e.target.value)}
                                    />

                                    <IconButton
                                        aria-label="delete question"
                                        onClick={() => deleteQuestion(questionIndex)}
                                        style={{  }}     //ПЛОХОЕ РЕШЕНИЕ НУЖНО ДОДЕЛАТЬ
                                    >
                                        <DeleteIcon />
                                    </IconButton>

                                    {questionData.answers.map((answer, answerIndex) => (
                                        <div className="field" key={answerIndex}>

                                            <TextField
                                                id={`answer-${questionIndex}-${answerIndex}`}
                                                label={`Ответ ${answerIndex + 1}`}
                                                variant="standard"
                                                value={answer}
                                                onChange={(e) => handleAnswerChange(questionIndex, answerIndex, e.target.value)}
                                            />

                                            <IconButton aria-label="delete"
                                                        onClick={() => deleteAnswer(questionIndex, answerIndex)}
                                                        disabled={questionData.answers.length <= 2}>
                                                <DeleteIcon/>
                                            </IconButton>
                                        </div>
                                    ))}

                                    <Button color="secondary" onClick={() => addAnswer(questionIndex)}>Добавить
                                        ответ</Button>
                                </div>
                            ))}
                        </div>
                        <div className="addQuestionButton">
                            <Button variant="contained" onClick={addQuestion}>Добавить вопрос</Button>
                        </div>
                        <div className="endOfCreate">
                            <Button variant="contained" color="secondary" onClick={addQuestionnaire}>Создать</Button>
                        </div>
                    </div>

                )}
            </div>

        </div>
    );
};

export default CreateQuestionnaires;
