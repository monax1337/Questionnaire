import React, { useState } from 'react';
import MyAppBar from "../Components/UI/AppBars/MyAppBar";
import Button from "@mui/material/Button";
import MyModal from "../Components/UI/MyModal/MyModal";
import QuestionnaireForm from "../Components/QuestionnaireForm";

const CreateQuestionnaires = () => {
    const [modal, setModal] = useState(true);

    const createQuestionnaire = () => {
        setModal(false);
    };

    return (
        <div>
            <MyModal visible={modal} setVisible={setModal} create={createQuestionnaire}>
                <QuestionnaireForm create={createQuestionnaire} />
            </MyModal>

            <MyAppBar navItems={['Выйти']} />
            <div className="mainContent">
                <div className="quesionContent">
                    <Button variant="outlined">
                        Primary
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CreateQuestionnaires;
