import React from 'react';
import Button from "@mui/material/Button";
import MyFormControl from "../Components/UI/FormControl/MyFormControl";

const ControlPanel = () => {
    const noFun=()=>{}
    return (
        <div>
            <h1 style={{display: "flex", justifyContent: "center"}}>Панель управления</h1>
            <div className="controlPanel">
                    <MyFormControl onDataReceived={noFun}/>
            </div>
            <Button variant="outlined">Primary</Button>
            <Button variant="outlined">Primary</Button>
        </div>

    );
};

export default ControlPanel;

//можно ли добавить инфу в столбец который уже заполнен   МОЖНО
//запрос на удаление групп и факультетов
//запрос на добавление групп и факультетов
//как мне получать данные из компонента который я использую в другом компоненте