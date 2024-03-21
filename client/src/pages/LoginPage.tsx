import React, {useEffect, useState} from 'react';
import MyAppBar from "../Components/UI/AppBars/MyAppBar";
import MyFormControl from "../Components/UI/FormControl/MyFormControl";
import Button from "@mui/material/Button";
import {TextField} from "@mui/material";


const LoginPage = () => {
    const [load, setLoad] = useState(true);
    const [userType, setUserType] = useState('student');
    const [showFormControl, setShowFormControl] = useState(true);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setLoad(false);
        }, 300); // 0.3 секунды в миллисекундах

        return () => {
            clearTimeout(timeoutId); // Очистить таймаут при размонтировании компонента
        };
    }, []);

    const handleLoginTypeChange = () => {
        if (userType === 'student') {
            setUserType('teacher');
            setShowFormControl(false);
        } else {
            setUserType('student');
            setShowFormControl(true);
        }
    };
    const handleDataReceived = (data: { faculty: string; groups: string[] }) => {
        console.log(data);

    };
    return (
        <div>
            <MyAppBar navItems={[]}/>
            {!load && (
                <div className="LoginForm">
                    <MyFormControl
                        onDataReceived={handleDataReceived}
                        style={{display: showFormControl ? 'flex' : 'none'}}
                        multiple={false}
                    />
                    {!showFormControl && userType === 'teacher' && (
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            maxWidth: '300px',
                            minWidth: '300px'
                        }}>
                            <TextField label="Login" variant="outlined"
                                       style={{marginBottom: "10px", marginTop: '10px',}}/>
                            <TextField label="Password" type="password"/>
                        </div>
                    )}
                    <Button variant="contained" style={{marginTop: '15px'}}>
                        Войти
                    </Button>
                    <Button
                        onClick={handleLoginTypeChange}
                        style={{
                            textTransform: 'none',
                            fontSize: '14px',
                            padding: '0',
                            textDecoration: 'none',
                            color: 'inherit',
                            cursor: 'pointer',
                            border: 'none',
                            background: 'none',
                            marginTop: '10px'
                        }}
                    >
                        {userType === 'student' ? 'Войти как преподаватель' : 'Войти как студент'}
                    </Button>
                </div>)}
        </div>
    );
};

export default LoginPage;
