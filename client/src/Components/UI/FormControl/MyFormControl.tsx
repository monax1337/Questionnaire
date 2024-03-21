import React, {FC, useEffect, useState} from 'react';
import {useWebSocket} from "../../../Contexts/WebSocketContext";
import {FormControl, InputLabel, MenuItem, Select, SelectChangeEvent} from "@mui/material";

interface iFormControl {
    onDataReceived({}): void;
    style?: React.CSSProperties;
    multiple?: boolean;
}

const MyFormControl: FC<iFormControl> = ({onDataReceived, style, multiple}) => {
    const [faculty, setFaculty] = useState('');
    const [groups, setGroups] = useState<string[]>([]);
    const {socket} = useWebSocket();
    const [availableFaculties, setAvailableFaculties] = useState<string[]>([]);
    const [availableGroups, setAvailableGroups] = useState<{ [key: string]: string[] }>({});

    useEffect(() => {
        if (socket) {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify(["RequestForAvailableGroups"]))
            }
            socket.onmessage = (event) => {
                console.log('Received message:', event.data);
                const [type, data] = JSON.parse(event.data);
                console.log("Data:", data); // Вывести весь объект data
                if (type === "AvailableGroups" && data) {
                    // Итерируемся по ключам объекта data
                    const faculties = Object.keys(data);
                    setAvailableFaculties(faculties); // Обновляем список факультетов

                    const allGroups = Object.entries(data).reduce((acc, [faculty, groups]) => {
                        acc[faculty] = groups as string[];
                        return acc;
                    }, {} as { [key: string]: string[] });
                    setAvailableGroups(allGroups);
                }
            };
        }
    }, [socket]);
    useEffect(() => {
        // Send selected faculty and groups to parent component
        sendDataToParent();
    }, [faculty, groups]);
    const handleFacultyChange = (e: SelectChangeEvent<string>) => {
        const newFaculty = e.target.value;
        setFaculty(newFaculty);
        if (newFaculty !== faculty) {
            setGroups([]);
        }
    };

    const handleGroupsChange = (e: SelectChangeEvent<string | string[]>) => {
        setGroups(e.target.value as string[] || []);
    };
    const sendDataToParent = () => {
        const data = 'Данные из дочернего компонента';
        onDataReceived({
            faculty, groups
        }); // Вызываем функцию из props с передачей данных
    };
    return (
        <div className="formControl" style={style}>
            <FormControl required style={{
                maxWidth: '300px',
                minWidth: '300px',
                marginTop: '10px',
                marginLeft: '5px'
            }}>
                <InputLabel id="faculty-select-label">Факультет</InputLabel>
                <Select
                    labelId="faculty-select-label"
                    id="faculty-select"
                    value={faculty}
                    onChange={handleFacultyChange}
                    style={{width: '100%'}}
                >
                    {availableFaculties.map((facultyName, index) => (
                        <MenuItem key={index} value={facultyName}>{facultyName}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            <FormControl required style={{
                maxWidth: '300px',
                minWidth: '300px',
                marginTop: '10px',
                marginLeft: '5px'
            }}>
                <InputLabel id="groups-select-label">{multiple ? "Группы" : "Группа"}</InputLabel>
                <Select
                    labelId="groups-select-label"
                    id="groups-select"
                    multiple={multiple}
                    value={groups}
                    onChange={handleGroupsChange}
                    style={{width: '100%'}}
                    renderValue={(selected) => {
                        if (multiple) {
                            return Array.isArray(selected) ? selected.join(', ') : '';
                        } else {
                            return selected;
                        }
                    }}
                >
                    {faculty && availableGroups[faculty] ? (
                        availableGroups[faculty].map((groupName, index) => (
                            <MenuItem key={index} value={groupName}>{groupName}</MenuItem>
                        ))
                    ) : (
                        <MenuItem disabled>Выберите факультет</MenuItem>
                    )}
                </Select>
            </FormControl>
        </div>
    );
};

export default MyFormControl;