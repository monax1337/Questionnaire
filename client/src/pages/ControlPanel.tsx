import React, {useEffect, useState} from 'react';
import Button from "@mui/material/Button";
import MyFormControl from "../Components/UI/FormControl/MyFormControl";
import {useWebSocket} from "../Contexts/WebSocketContext";

const ControlPanel = () => {
    const [load,setLoad]=useState(true);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setLoad(false);
        }, 300); // 0.3 секунды в миллисекундах

        return () => {
            clearTimeout(timeoutId); // Очистить таймаут при размонтировании компонента
        };
    }, []);

    const noFun=()=>{}
    return (
        <div>
            {!load && (
            <div>
                <h1 style={{display: "flex", justifyContent: "center"}}>Панель управления</h1>
                <div className="controlPanel">
                        <MyFormControl onDataReceived={noFun}/>
                </div>
                <Button variant="outlined">Primary</Button>
                <Button variant="outlined">Primary</Button>
            </div>
            )}
        </div>
    );
};

export default ControlPanel;
