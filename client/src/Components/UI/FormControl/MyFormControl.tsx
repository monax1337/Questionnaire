import React, { FC, useEffect, useState } from 'react';
import { useWebSocket } from "../../../Contexts/WebSocketContext";
import { Checkbox, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import ListItemText from "@mui/material/ListItemText";

interface iFormControl {
    onDataReceived(data: { faculty: string; groups: string[] }): void;
    style?: React.CSSProperties;
    multiple?: boolean;
    data: { faculty: string; groups: string[] } | null;
}

const MyFormControl: FC<iFormControl> = ({ onDataReceived, style, multiple, data }) => {
    const [faculty, setFaculty] = useState('');
    const [groups, setGroups] = useState<string[]>([]);
    const { socket } = useWebSocket();
    const [availableFaculties, setAvailableFaculties] = useState<string[]>([]);
    const [availableGroups, setAvailableGroups] = useState<{ [key: string]: string[] }>({});

    useEffect(() => {
        if (data) {
            const { faculty, groups } = data;

            const newData: { [key: string]: string[]; } = {};
            newData[faculty] = groups;

            // Если доступны новые факультеты, обновляем их список
            const newFaculties = Object.keys(newData);
            setAvailableFaculties(newFaculties);
            setAvailableGroups(newData);
        }
        else if (socket) {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify(["RequestForAvailableGroups"]))
            }
            socket.onmessage = (event) => {
                const [type, data] = JSON.parse(event.data);
                if (type === "AvailableGroups" && data) {
                    const faculties = Object.keys(data);
                    setAvailableFaculties(faculties);
                    setAvailableGroups(data);
                }
            };
        }
    }, [socket]);

    useEffect(() => {
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
        setGroups(e.target.value as string[]);
    };

    const sendDataToParent = () => {
        onDataReceived({ faculty, groups });
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
                    style={{ width: '100%' }}
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
                    style={{ width: '100%' }}
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
