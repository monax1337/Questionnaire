import React, {useState, useEffect} from 'react';
import {FormControl, RadioGroup, FormControlLabel, Radio, Button} from '@mui/material';
import Typography from "@mui/material/Typography";
import MyAppBar from "../Components/UI/AppBars/MyAppBar";
import {useWebSocket} from "../Contexts/WebSocketContext";
import {useNavigate, useParams} from "react-router-dom";

const QuestionnairesCompletion: React.FC = () => {
    const [selectedOption, setSelectedOption] = useState<number>(-1);
    const {socket} = useWebSocket();
    const [questions, setQuestions] = useState<string[]>([]);
    const [answerOptions, setAnswerOptions] = useState<string[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
    const currentQuestion = questions[currentQuestionIndex];
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
                    setQuestions(payload);
                    setCurrentQuestionIndex(0);
                    setSelectedOption(-1);
                    setSelectedAnswers([]);
                } else if (type === 'SendAnswerOptions') {
                    setAnswerOptions(payload);
                }
            };
        }
    }, [socket, name]);

    const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedOption(parseInt((event.target as HTMLInputElement).value));
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setSelectedAnswers([...selectedAnswers, selectedOption]);
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedOption(-1);
        } else {
            setSelectedAnswers([...selectedAnswers, selectedOption]);
            alert("Вы прошли анкету!");
            console.log("Массив ответов:", selectedAnswers);
            //navigate('/questionnaires');
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
                                    <FormControlLabel key={index} value={index} control={<Radio/>} label={option}/>
                                ))}
                            </RadioGroup>
                        </FormControl>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleNextQuestion}
                            disabled={selectedOption === -1}
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