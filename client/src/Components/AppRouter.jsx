import React from 'react';
import {Navigate, Route, Routes} from "react-router-dom";
import Questionnaires from "../pages/Questionnaires";
import ControlPanel from "../pages/ControlPanel";
import CreateQuestionnaires from "../pages/CreateQuestionnaires";
import QuestionnairesCompletion from "../pages/QuestionnairesCompletion";
import ProfessorQuestionnaires from "../pages/ProfessorQuestionnaires";

const AppRouter = () => {
    return (
        <Routes>
            <Route path="/controlPanel" element={<ControlPanel/>}/>
            <Route path="/createQuestionnaires" element={<CreateQuestionnaires/>}/>
            <Route path="/questionnaires" element={<Questionnaires/>}/>
            <Route path="/professorQuestionnaires" element={<ProfessorQuestionnaires/>}/>
            {/*<Route path="/completion" element={<QuestionnairesCompletion />}/>*/}
            <Route path="/completion/:name" element={<QuestionnairesCompletion/>}/>
            <Route path="/" element={<Navigate to="/questionnaires"/>}/>
            <Route path="*" element={<Questionnaires/>}/>
        </Routes>
    );
};

export default AppRouter;