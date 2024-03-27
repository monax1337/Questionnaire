import React from 'react';
import {Navigate, Route, Routes} from "react-router-dom";
import Questionnaires from "../pages/Questionnaires";
import ControlPanel from "../pages/ControlPanel";
import CreateQuestionnaires from "../pages/CreateQuestionnaires";
import QuestionnairesCompletion from "../pages/QuestionnairesCompletion";
import ProfessorQuestionnaires from "../pages/ProfessorQuestionnaires";
import LoginPage from "../pages/LoginPage";
import QuestionnairesResults from "../pages/QuestionnairesResults";


const AppRouter = () => {
    return (
        <Routes>
            <Route path="/controlPanel" element={<ControlPanel/>}/>
            <Route path="/createQuestionnaires" element={<CreateQuestionnaires/>}/>
            <Route path="/questionnaires" element={<Questionnaires/>}/>
            <Route path="/professorQuestionnaires" element={<ProfessorQuestionnaires/>}/>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/results" element={<QuestionnairesResults />} />
            <Route path="/results/:name" element={<QuestionnairesResults />} />
            {/*<Route path="/completion" element={<QuestionnairesCompletion />}/>*/}
            <Route path="/completion/:name" element={<QuestionnairesCompletion/>}/>
            <Route path="/" element={<Navigate to="/login"/>}/>
            <Route path="*" element={<LoginPage />}/>
        </Routes>
    );
};

export default AppRouter;