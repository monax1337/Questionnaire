    import React, {useEffect, useState} from 'react';
    import MyAppBar from "../Components/UI/AppBars/MyAppBar";
    import {useWebSocket} from "../Contexts/WebSocketContext";
    import {useParams} from "react-router-dom";
    import MyFormControl from "../Components/UI/FormControl/MyFormControl";
    import Typography from "@mui/material/Typography";

    const QuestionnairesResults = () => {
        const {socket} = useWebSocket();
        const [questions, setQuestions] = useState<string[]>([]);
        const [answerOptions, setAnswerOptions] = useState<string[]>([]);
        const [groups, setGroups] = useState<string[]>([]);
        const [faculty, setFaculty] = useState<string>('');
        const {name} = useParams<{ name: string }>();
        const [load, setLoad] = useState(true);
        const [availableGroupsForQuestionnaire,setAvailableGroupsForQuestionnaire]=useState<{ faculty: string; groups: string[] } | null>(null);
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
                      console.log(faculty + " " + groups);
                      setAvailableGroupsForQuestionnaire({faculty, groups});
                  }
                    if (type === 'SendQuestion') {
                        setQuestions(payload);
                    }
                    if (type === 'SendAnswerOptions') {
                        setAnswerOptions(payload);
                    }
                        //setLoad(false);
                };
            }
        }, [socket, name]);

        useEffect(() => {
            const timeoutId = setTimeout(() => {
                setLoad(false);
            }, 700); // 0.3 секунды в миллисекундах

            return () => {
                clearTimeout(timeoutId); // Очистить таймаут при размонтировании компонента
            };
        }, []);

        return (
            <div>
                <MyAppBar navItems={['Выйти', 'Вернуться']}/>
                {!load && (
                    <div className="QuestionnaireInfo">
                        <Typography textAlign="center" variant='h5'>
                            {name}
                        </Typography>
                        <Typography variant="body1">
                            Факультет: {faculty}
                        </Typography>
                        <Typography variant="body1">
                            Доступные группы: {groups.join(', ')}
                        </Typography>
                        <MyFormControl
                            onDataReceived={() => {
                            }}
                            multiple={false}
                            data={availableGroupsForQuestionnaire}
                        />
                    </div>
                )}
            </div>
        );
    };

    export default QuestionnairesResults;