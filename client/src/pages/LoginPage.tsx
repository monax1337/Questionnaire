import React, {useEffect, useState} from 'react';
import MyAppBar from "../Components/UI/AppBars/MyAppBar";
import MyFormControl from "../Components/UI/FormControl/MyFormControl";
import Button from "@mui/material/Button";
import {TextField} from "@mui/material";
import {useWebSocket} from "../Contexts/WebSocketContext";
import {useNavigate} from "react-router-dom";

const LoginPage = () => {
    const [load, setLoad] = useState(true);
    const [userType, setUserType] = useState('student');
    const [showFormControl, setShowFormControl] = useState(true);
    const [selectedGroup,setSelectedGroup]=useState({});
    const [nothing,setNothing]=useState<null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setLoad(false);
        }, 300);

        return () => {
            clearTimeout(timeoutId);
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
        setSelectedGroup(data)
    };

    const sendGroup=()=>{
        console.log(selectedGroup)
        navigate('/questionnaires', { state: { selectedGroup } });
    }

    return (
        <div>
            <MyAppBar navItems={[]}/>
            {!load && (
                <div className="LoginForm">
                    <MyFormControl
                        onDataReceived={handleDataReceived}
                        style={{display: showFormControl ? 'flex' : 'none'}}
                        multiple={false}
                        data={nothing}
                        selectFirstByDefault={true}
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
                    <Button variant="contained" style={{marginTop: '15px'}} onClick={sendGroup}>
                        Войти
                    </Button>
                    <Button
                        disabled={true}
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
