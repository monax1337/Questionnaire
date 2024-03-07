import React, {useState, useEffect} from 'react';
import {FormControl, RadioGroup, FormControlLabel, Radio, Button} from '@mui/material';
import Typography from "@mui/material/Typography";
import MyAppBar from "../Components/UI/AppBars/MyAppBar";
import {useWebSocket} from "../Contexts/WebSocketContext";
import {useLocation} from "react-router-dom";

const QuestionnairesCompletion: React.FC = () => {
    const [selectedOption, setSelectedOption] = useState<string>('');
    const {socket} = useWebSocket();
    const [questions, setQuestions] = useState<string[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const currentQuestion = questions[currentQuestionIndex];

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const name = queryParams.get('name');

    useEffect(() => {
        if (socket) {
            socket.onopen = () => {
                if (name){
                    console.log(name);
                }

                socket.send(JSON.stringify(["RequestForQuestion", name]))
            }
            socket.onmessage = (event) => {
                console.log("fasf")
                const data = JSON.parse(event.data);
                console.log(data)
                const [type, payload] = data;
                if (type === 'SendQuestion') {
                    setQuestions(payload); // Установка массива вопросов
                    setCurrentQuestionIndex(0); // Сброс индекса текущего вопроса
                    setSelectedOption(''); // Сброс выбранного ответа
                }
            };
        }
    }, [socket]);

    const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedOption((event.target as HTMLInputElement).value);
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedOption('');
        } else {
            // Это последний вопрос, здесь вы можете выполнить какие-либо дополнительные действия
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
                                {/* Варианты ответов для текущего вопроса */}
                                {/* Можно реализовать аналогичным образом, как вы делали ранее */}
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
