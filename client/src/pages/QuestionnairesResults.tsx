import React, {useEffect, useState} from 'react';
import MyAppBar from "../Components/UI/AppBars/MyAppBar";
import {useWebSocket} from "../Contexts/WebSocketContext";
import {useParams} from "react-router-dom";
import MyFormControl from "../Components/UI/FormControl/MyFormControl";
import Typography from "@mui/material/Typography";
import {List, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from '@mui/material';
import ListItem from "@mui/material/ListItem";

const QuestionnairesResults = () => {
    const {socket} = useWebSocket();
    const [questions, setQuestions] = useState<string[]>([]);
    const [answerOptions, setAnswerOptions] = useState<string[][]>([]);
    const [answerOptionsResults, setAnswerOptionsResults] = useState<{ [question: string]: number[] }>({});
    const [groups, setGroups] = useState<string[]>([]);
    const [faculty, setFaculty] = useState<string>('');
    const {name} = useParams<{ name: string }>();
    const [load, setLoad] = useState(true);
    const [availableGroupsForQuestionnaire, setAvailableGroupsForQuestionnaire] = useState<{
        faculty: string;
        groups: string[]
    } | null>(null);

    useEffect(() => {
        if (socket && socket.readyState === WebSocket.OPEN && name) {
            socket.send(JSON.stringify(["RequestForAvailableGroupsForQuestionnaire", name]));
            socket.send(JSON.stringify(["RequestForQuestion", name]));
            socket.send(JSON.stringify(["RequestForAnswerOptions", name]));
        }
    }, [socket, name]);

    useEffect(() => {
        if (socket) {
            socket.onopen = () => {
                socket.send(JSON.stringify(["RequestForAvailableGroupsForQuestionnaire", name]));
                socket.send(JSON.stringify(["RequestForQuestion", name]));
                socket.send(JSON.stringify(["RequestForAnswerOptions", name]));
            };
            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log(data)
                const [type, payload] = data;
                if (type === 'AvailableGroupsForQuestionnaire') {
                    const {faculty10: faculty, groups10: groups} = payload;
                    //console.log(faculty + " " + groups);
                    setAvailableGroupsForQuestionnaire({faculty, groups});
                }
                if (type === 'SendQuestion') {
                    setQuestions(payload);
                }
                if (type === 'SendAnswerOptions') {
                    setAnswerOptions(payload.map((options: string[]) => [...options]));
                    //console.log(answerOptions)
                }
                if (type === 'Answers') {
                    console.log("Received answer results:", payload);
                    const maxOptionsCount = Math.max(...answerOptions.map(options => options.length));
                    const results: { [question: string]: number[] } = {};

                    if (payload && Array.isArray(payload)) {
                        payload.forEach((studentAnswers: number[][], studentIndex: number) => {
                            if (Array.isArray(studentAnswers)) {
                                studentAnswers.forEach((answers: number[], questionIndex: number) => {
                                    if (Array.isArray(answers)) {
                                        const question = questions[questionIndex];
                                        if (!results[question]) {
                                            results[question] = new Array(maxOptionsCount).fill(0);
                                        }
                                        answers.forEach((answer, optionIndex) => {
                                            results[question][optionIndex] += answer;
                                        });
                                    }
                                });
                            }
                        });
                    }

                    //console.log("Computed answer results:", results);
                    setAnswerOptionsResults(results);
                }
                //setLoad(false);
            };
        }
    }, [socket, name, questions, answerOptions]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setLoad(false);
        }, 1000);

        return () => {
            clearTimeout(timeoutId);
        };
    }, []);

    useEffect(() => {
        if (socket && socket.readyState === WebSocket.OPEN && groups && groups.length > 0) {
            socket.send(JSON.stringify(["RequestForAnswers", {name: name, faculty: faculty, group: groups}]));
        }
    }, [groups]);

    const handleDataReceived = (data: { faculty: string; groups: string[] }) => {
        if (data.groups.length > 0) {
            setFaculty(data.faculty);
            setGroups(data.groups);
        }
    };

    return (
        <div>
            <MyAppBar navItems={['Выйти', 'Вернуться']}/>
            {!load && (
                <div className="QuestionnaireInfo">
                    <Typography textAlign="center" variant='h5'>
                        {name}
                    </Typography>
                    <Typography variant="body1">
                        Имеют доступ
                    </Typography>
                    <MyFormControl
                        onDataReceived={handleDataReceived}
                        multiple={false}
                        data={availableGroupsForQuestionnaire}
                    />
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Вопрос</TableCell>
                                    <TableCell>Варианты ответов</TableCell>
                                    <TableCell>Количество ответов</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {questions.map((question, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{question}</TableCell>
                                        <TableCell>
                                            <List dense>
                                                {answerOptions && answerOptions.map((option, idx) => (
                                                    <ListItem key={idx}>{option}</ListItem>
                                                ))}
                                            </List>
                                        </TableCell>
                                        <TableCell>
                                            <List dense>
                                                {answerOptions.map((option, idx) => (
                                                    <ListItem
                                                        key={idx}>{answerOptionsResults[question] && answerOptionsResults[question][idx]}</ListItem>
                                                ))}
                                            </List>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            )}
        </div>
    );
};

export default QuestionnairesResults;