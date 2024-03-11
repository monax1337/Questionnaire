import React, {useState, useEffect} from 'react';
import {FormControl, RadioGroup, FormControlLabel, Radio, Button} from '@mui/material';
import Typography from "@mui/material/Typography";
import MyAppBar from "../Components/UI/AppBars/MyAppBar";
import {useWebSocket} from "../Contexts/WebSocketContext";
import {useLocation, useNavigate, useParams} from "react-router-dom";

const QuestionnairesCompletion: React.FC = () => {
    const [selectedOption, setSelectedOption] = useState<string>('');
    const {socket} = useWebSocket();
    const [questions, setQuestions] = useState<string[]>([]);
    const [answerOptions, setAnswerOptions] = useState<string[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const currentQuestion = questions[currentQuestionIndex];

    // const location = useLocation();
    // const queryParams = new URLSearchParams(location.search);
    const {name} = useParams<{ name: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        if (socket && socket.readyState === WebSocket.OPEN && name) {
            socket.send(JSON.stringify(["RequestForQuestion", name]));
            socket.send(JSON.stringify(["RequestForAnswerOptions", name]));
        }
    }, [socket, name]);

    useEffect(() => {
        if (socket) {
            socket.onopen = () => {
                socket.send(JSON.stringify(["RequestForQuestion", name]));
                socket.send(JSON.stringify(["RequestForAnswerOptions", name]));
            };
            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                const [type, payload] = data;
                if (type === 'SendQuestion') {
                    setQuestions(payload); // Установка массива вопросов
                    setCurrentQuestionIndex(0); // Сброс индекса текущего вопроса
                    setSelectedOption(''); // Сброс выбранного ответа
                } else if (type === 'SendAnswerOptions') {
                    setAnswerOptions(payload); // Установка массива вариантов ответов
                }
            };
        }
    }, [socket, name]);

    const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedOption((event.target as HTMLInputElement).value);
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedOption('');
        } else {
            alert("Вы прошли анкету!");
            navigate('/questionnaires');
        }
    };

    return (
        <div>
            <MyAppBar navItems={['Выйти', 'Вернуться']}/>
            <div className="QuestionnaireCard">
                {currentQuestion && (
                    <>
                        <Typography variant="h5" gutterBottom>
                            {currentQuestion}
                        </Typography>
                        <FormControl component="fieldset">
                            <RadioGroup aria-label="options" name="options" value={selectedOption}
                                        onChange={handleOptionChange}>
                                {answerOptions.map((option, index) => (
                                    <FormControlLabel key={index} value={option} control={<Radio/>} label={option}/>
                                ))}
                            </RadioGroup>
                        </FormControl>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleNextQuestion}
                            disabled={!selectedOption}
                            sx={{marginTop: '10px'}}
                        >
                            Ответить
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
};

export default QuestionnairesCompletion;
