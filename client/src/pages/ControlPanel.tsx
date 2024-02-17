import React from 'react';
import Button from "@mui/material/Button";

const ControlPanel = () => {
    return (
        <div>
            <h1 style={{display: "flex", justifyContent: "center"}}>Панель управления</h1>
            <div className="controlPanel">
                    <Button variant="outlined">Primary</Button>
                    <Button variant="outlined">Primary</Button>
            </div>
        </div>

    );
};

export default ControlPanel;