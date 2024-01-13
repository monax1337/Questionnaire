import React from 'react';
import {Route, Routes} from "react-router-dom";
import Questionnaires from "../pages/Questionnaires";

const AppRouter = () => {
    return (
        <Routes>
            <Route path="/questionnaires" element={<Questionnaires />}/>
        </Routes>
    );
};

export default AppRouter;