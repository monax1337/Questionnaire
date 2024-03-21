import React, {useEffect, useState} from 'react';
import MyAppBar from "../Components/UI/AppBars/MyAppBar";
import MyModal from "../Components/UI/Modals/MyModal";
import {
    TextField,
    Button,
    IconButton,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Checkbox,
    ListItemText
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import {SelectChangeEvent} from '@mui/material';
import {useWebSocket} from "../Contexts/WebSocketContext";
import MyFormControl from "../Components/UI/FormControl/MyFormControl";

const CreateQuestionnaires = () => {
    const [modal, setModal] = useState(true);
    const [questionnaire, setQuestionnaire] = useState([{question: '', answers: ['', '']}]);
    const [formName, setFormName] = useState('');
    const [faculty, setFaculty] = useState('');
    const [groups, setGroups] = useState<string[]>([]);
    const [nothing,setNothing]=useState<null>(null);
    const {socket} = useWebSocket();


    // Функция для открытия/закрытия модального окна
    const toggleModal = () => {
        setModal(prevModal => !prevModal);
    };

    // Функция для добавления вопроса
    const addQuestion = () => {
        setQuestionnaire(prevQuestionnaire => [...prevQuestionnaire, {question: '', answers: ['', '']}]);
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

        if (answersArray.length > 1) {
            const newQuestionnaire = Array.from({length: Number(numberOfQuestions)}, (_, index) => ({
                question: `Вопрос ${index + 1}`,
                answers: answersArray.slice(), // Копируем массив ответов
            }));
            setQuestionnaire(newQuestionnaire);
        } else {
            const newQuestionnaire = Array.from({length: Number(numberOfQuestions)}, (_, index) => ({
                question: `Вопрос ${index + 1}`,
                answers: ['', ''], // Копируем массив ответов
            }));
            setQuestionnaire(newQuestionnaire);
        }
        // Сохраняем опросник
    };


    const handleFormNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormName(e.target.value);
    };


    const sendQuestionnaireData = (data: any) => {
        if (socket)
            socket.send(JSON.stringify(["ReceiveProfessorQuestionnaire", data]));
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
    const handleDataFromChild = () => {

    };

    return (
        <div>
            <MyAppBar navItems={['Выйти']}/>
            <MyModal visible={modal} setVisible={toggleModal} create={createQuestionnaire}/>

            <div className="allContent">
                {!modal && (
                    <div className="mainContent">
                        <div className="formControl">
                            <TextField
                                label="Название анкеты"
                                value={formName}
                                onChange={handleFormNameChange}
                                sx={{marginLeft: '5px'}}
                            />
                            <MyFormControl onDataReceived={handleDataFromChild} multiple={true} data={nothing}/>

                        </div>
                        <div className="questionContent">
                            {questionnaire.map((questionData, questionIndex) => (
                                <div className="question" key={questionIndex}>
                                    <div>
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
                                            style={{}}
                                        >
                                            <DeleteOutlinedIcon/>
                                        </IconButton>
                                    </div>
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
                                    <Button sx={{marginTop: '15px'}} color="secondary"
                                            onClick={() => addAnswer(questionIndex)}>Добавить
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
