import React, {useState, useEffect} from 'react';
import {FormControl, RadioGroup, FormControlLabel, Radio, Button} from '@mui/material';
import Typography from "@mui/material/Typography";
import MyAppBar from "../Components/UI/AppBars/MyAppBar";
import {useWebSocket} from "../Contexts/WebSocketContext";
import {useLocation, useNavigate, useParams} from "react-router-dom";

interface SelectedAnswers {
    questionIndex: number;
    selectedOptions: (0 | 1)[]; // Массив с 0 и 1 для каждого варианта ответа
}

const QuestionnairesCompletion: React.FC = () => {
    const [selectedOption, setSelectedOption] = useState<number>(-1);
    const {socket} = useWebSocket();
    const [questions, setQuestions] = useState<string[]>([]);
    const [answerOptions, setAnswerOptions] = useState<string[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const currentQuestion = questions[currentQuestionIndex];
    const [currentAnswers, setCurrentAnswers] = useState<SelectedAnswers[]>([]);
    const [selectedAnswers, setSelectedAnswers] = useState<(0 | 1)[][]>([[]]);
    const [savedAnswers, setSavedAnswers] = useState<(0 | 1)[][]>([]);
    const {name} = useParams<{ name: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const {faculty, groups} = location.state || {};
    const selectedGroup = {groups, faculty};


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
        const selectedOption = parseInt((event.target as HTMLInputElement).value);
        setSelectedAnswers(prevAnswers => {
            const updatedAnswers = [...prevAnswers];
            updatedAnswers[currentQuestionIndex] = new Array(answerOptions.length).fill(0).map((_, index) => (index === selectedOption ? 1 : 0));
            return updatedAnswers;
        });
        setSelectedOption(selectedOption);
    };

    const handleNextQuestion = () => {
        if (selectedOption !== -1) {
            setSelectedAnswers((prevSelectedAnswers) => [
                ...prevSelectedAnswers,
                new Array(answerOptions.length).fill(0).map((_, index) => (index === selectedOption ? 1 : 0))
            ]);
        }

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedOption(-1);
        } else {
            setSavedAnswers((prevSavedAnswers) => [
                ...prevSavedAnswers,
                ...selectedAnswers,
            ]);
            console.log(selectedAnswers);
            if (socket) {
                socket.send(JSON.stringify(["SendStudentAnswers", [name,
                    groups,
                    selectedAnswers]]));
            }
            alert("Вы прошли анкету!");


            setSelectedAnswers([]);
            navigate('/questionnaires', {state: {selectedGroup}});

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
