import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import {Link} from "react-router-dom";

interface MyCardProps {
    name: string;
    type: string;
    faculty?: string;
    groups?: string;
}

const MyCard = ({name, type, faculty, groups}: MyCardProps) => {
    return (
        <Box sx={{minWidth: 300}}>
            <Card variant="outlined" sx={{margin: 2}}>
                <React.Fragment>
                    <CardContent>
                        <Typography
                            variant="h4"
                            component="div"
                            sx={{
                                wordWrap: "break-word",
                                overflowWrap: "break-word",
                                whiteSpace: "pre-wrap"
                            }}
                        >
                            {name}
                        </Typography>
                    </CardContent>
                    <CardActions>
                        {
                            type === "professor"
                                ?
                                <Link to={`/results/${name}`}>
                                    <Button size="small">Перейти</Button>
                                </Link>
                                :
                                <Link to={`/completion/${name}`} state={{ faculty, groups }}>
                                    <Button size="small">Перейти</Button>
                                </Link>
                        }
                    </CardActions>
                </React.Fragment>
            </Card>
        </Box>
    );
};

export default MyCard;