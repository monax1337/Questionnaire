import * as sql from 'mssql';
import * as WebSocket from 'ws';

const config: sql.config = {
    user: 'username',
    password: 'password',
    server: 'localhost',
    database: 'questionnaires',
};

const server = new WebSocket.Server({ port: 8080 });

server.on('connection', async (ws: WebSocket) => {
    console.log('connection')

    ws.on('message', async (message: string) => {

        const msg: any[] = JSON.parse(message);

        switch (msg[0]) {

            case 'RequestForQuestionnaireStudent':

                const pool1 = await sql.connect(config);

                const result1 = await pool1.request()
                    .query(`
                        SELECT QuestionnairesName, Groups
                        FROM questionnairesdata
                    `);

                pool1.close();

                let groupsArray: string[] = [];
                const questionnaires1: string[] = [];

                for (let i = 0; i < result1.recordset.length; i++) {
                    if (result1.recordset[i].Groups === 'Все') {
                        questionnaires1.push(result1.recordset[i].QuestionnairesName);
                    } else {
                        groupsArray = JSON.parse(result1.recordset[i].Groups);
                        if (groupsArray.includes(msg[1])) {
                            questionnaires1.push(result1.recordset[i].QuestionnairesName);
                        }
                    }
                }

                ws.send(JSON.stringify(['AvailableQuestionnaires', questionnaires1]));

                break;

            case 'RequestForQuestionnairesProfessor':

                const pool2 = await sql.connect(config);

                const result2 = await pool2.request()
                    .query(`
                        SELECT QuestionnairesName
                        FROM questionnairesdata
                        WHERE ProfessorName = '${msg[1]}'
                    `);

                pool2.close();

                const questionnaires2: string[] = [];

                for (let i = 0; i < result2.recordset.length; i++) {
                    questionnaires2.push(result2.recordset[i].QuestionnairesName);
                }

                ws.send(JSON.stringify(['AvailableQuestionnaires', questionnaires2]));

                break;

            case 'RequestForQuestion':

                const pool3 = await sql.connect(config);

                const result3 = await pool3.request()
                    .query(`
                        SELECT Questions, Answers
                        FROM Questionnairesdata
                        WHERE QuestionnairesName = '${msg[1]}'
                    `);

                pool3.close();

                const questions: string[] = [];
                const answers: string[] = [];

                for (let i = 0; i < result3.recordset.length; i++) {
                    const arr1 = result3.recordset[i].Questions.split('~');
                    const arr2 = result3.recordset[i].Answers.split('~');

                    questions.push(...arr1);
                    answers.push(...arr2);
                }

                ws.send(JSON.stringify(['SendQuestion', questions, answers]));

                break;

            case 'SendStudentAnswer':

                const pool4 = await sql.connect(config);

                const data4 = {
                    QuestionnairesName: msg[3],
                    GroupNumber: msg[2],
                    Answers: JSON.stringify(msg[1]),
                };

                const result4 = await pool4.request()
                    .query`
                    INSERT INTO studentanswers
                        (QuestionnairesName, GroupNumber, Answers)
                    VALUES (@QuestionnairesName, @GroupNumber, @Answers)
                `;

                pool4.close();

                if (result4.rowsAffected[0] === 1) {
                    ws.send(JSON.stringify(['Success']));
                } else {
                    ws.send(JSON.stringify(['Error', 'Ошибка отправки ответов']));
                }

                break;

            case 'ReceiveProfessorQuestionnaire':

                const pool5 = await sql.connect(config);

                const data5 = {
                    QuestionnairesName: msg[1],
                    Questions: msg[2],
                    Answers: msg[3],
                    Groups: msg[4],
                    ProfessorName: msg[5],
                };

                const result5 = await pool5.request()
                    .query`
                    INSERT INTO Questionnairesdata
                        (QuestionnairesName, Questions, Answers, Groups, ProfessorName)
                    VALUES (@QuestionnairesName, @Questions, @Answers, @Groups, @ProfessorName)
                `;

                pool5.close();

                if (result5.rowsAffected[0] === 1) {
                    ws.send(JSON.stringify(['Success']));
                } else {
                    ws.send(JSON.stringify(['Error', 'Ошибка отправки анкеты']));
                }

                break;

            case 'Register':
                const pool6 = await sql.connect(config);

                const result6 = await pool6.request()
                    .query`
                    SELECT login
                    FROM accounts
                    WHERE login = ${msg[1]}
                `;

                if (result6.recordset.length > 0) {
                    ws.send(JSON.stringify(['Error', 'Пользователь уже существует']));
                } else {

                    const data6 = {
                        login: msg[1],
                        password: msg[2],
                    };

                    const result7 = await pool6.request()
                        .query`
                        INSERT INTO Accounts
                            (login, password)
                        VALUES (@login, @password)
                    `;

                    if (result7.rowsAffected[0] === 1) {
                        ws.send(JSON.stringify(['Success']));
                    } else {
                        ws.send(JSON.stringify(['Error', 'Ошибка добавления пользователя']));
                    }

                }

                pool6.close();

                break;
            case 'Login':
                const pool8 = await sql.connect(config);

                const result8 = await pool8.request()
                    .query`
                    SELECT *
                    FROM accounts
                    WHERE login = ${msg[1]}
                      AND password = ${msg[2]}
                `;

                if (result8.recordset.length > 0) {
                    ws.send(JSON.stringify(['Success']));
                } else {
                    ws.send(JSON.stringify(['Error', 'Неверный логин или пароль']));
                }

                pool8.close();

                break;
        }

    });

});
