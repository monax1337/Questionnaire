import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

interface MyCardProps {
    name: string;
}

const MyCard = ({name}:MyCardProps) => {
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
                        <Button size="small">Перейти</Button>
                    </CardActions>
                </React.Fragment>
            </Card>
        </Box>
    );
};

export default MyCard;