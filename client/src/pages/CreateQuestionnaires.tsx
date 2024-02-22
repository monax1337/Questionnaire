import React, { useState } from 'react';
import MyAppBar from "../Components/UI/AppBars/MyAppBar";
import Button from "@mui/material/Button";
import MyModal from "../Components/UI/Modals/MyModal";


const CreateQuestionnaires = () => {
    const [modal, setModal] = useState(true);

    // Call createQuestionnaire and close modal after creating

    const createQuestionnaire =() => {
        setModal(false);
    };

    return (
        <div>
            <MyModal visible={modal} setVisible={setModal} create={createQuestionnaire}/>


            <MyAppBar navItems={['Выйти']} />
            <div className="mainContent">
                <div className="quesionContent">
                    <Button variant="outlined" >
                        Primary
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CreateQuestionnaires;