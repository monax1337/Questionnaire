import React from 'react';
import {Navigate, Route, Routes} from "react-router-dom";
import Questionnaires from "../pages/Questionnaires";

const AppRouter = () => {
    return (
        <Routes>
            <Route path="/questionnaires" element={<Questionnaires />}/>
            <Route path="/" element={<Navigate to="/questionnaires"/>}/>
            <Route path="*" element={<Questionnaires/>}/>
        </Routes>
    );
};

export default AppRouter;