import * as sql from 'mssql';
import * as WebSocket from 'ws';

// Database configuration
const config: sql.config = {
    user: 'sa',
    password: 'Pass1234567890',
    server: 'mssql',
    database: 'Questionnaires',
    port: 1433,
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

const pool = new sql.ConnectionPool(config);
pool.connect()
    .then(() => console.log('Connection pool created'))
    .catch(err => console.error('Error creating connection pool', err));

// WebSocket server setup
const server = new WebSocket.Server({port: 8080});

// Event listener for incoming connections
server.on('connection', async (ws: WebSocket) => {
    console.log('connection');

    // Event listener for incoming messages
    ws.on('message', async (message: string) => {
        try {
            // Parsing incoming message as JSON
            const msg: any[] = JSON.parse(message);

            // Switch statement to handle different types of requests
            switch (msg[0]) {
                // Handling request for available groups
                case 'RequestForAvailableGroups':
                    // Connect to the database
                    const pool0 = await sql.connect(config);
                    // Query to fetch available groups
                    const result0 = await pool0.request()
                        .query(`
                            SELECT DISTINCT Faculty, Groups
                            FROM AvailableGroups
                        `);
                    pool0.close();

                    // Extracting available groups from the result and sending them to the client
                    let availableGroupsObject: any = {};
                    for (let i = 0; i < result0.recordset.length; i++) {
                        const faculty = result0.recordset[i].Faculty;
                        const groups = JSON.parse(result0.recordset[i].Groups);
                        availableGroupsObject[faculty] = groups;
                    }

                    ws.send(JSON.stringify(['AvailableGroups', availableGroupsObject]));
                    break;

                // Handling request for questionnaires available to students
                case 'RequestForQuestionnaireStudent':

                    const pool1 = await sql.connect(config);
                    const result1 = await pool1.request()
                        .query(`
                            SELECT SurveyName
                            FROM Questionnaires
                            WHERE Faculty = '${msg[1].faculty}'
                              AND (Groups LIKE '%${msg[1].group}%')
                        `);
                    pool1.close();

                    // Extracting available questionnaires for students and sending them to the client
                    const questionnaires1: string[] = [];
                    for (let i = 0; i < result1.recordset.length; i++) {
                        questionnaires1.push(result1.recordset[i].SurveyName);
                    }
                    ws.send(JSON.stringify(['AvailableQuestionnaires', questionnaires1]));
                    break;

                // Handling request for questionnaires available to professors
                case 'RequestForQuestionnairesProfessor':
                    const pool2 = await sql.connect(config);
                    const result2 = await pool2.request()
                        .query(`
                            SELECT SurveyName
                            FROM Questionnaires
                            WHERE ProfessorName = '${msg[1]}'
                        `);
                    pool2.close();

                    // Extracting available questionnaires for professors and sending them to the client
                    const questionnaires2: string[] = [];
                    for (let i = 0; i < result2.recordset.length; i++) {
                        questionnaires2.push(result2.recordset[i].SurveyName);
                    }

                    ws.send(JSON.stringify(['AvailableQuestionnaires', questionnaires2]));
                    break;

                // Handling request for questions in a questionnaire
                case 'RequestForQuestion':
                    const pool3 = await sql.connect(config);
                    const result3 = await pool3.request()
                        .query(`
                            SELECT QuestionText
                            FROM SurveyQuestions
                            WHERE questionnaire_id = (SELECT id
                                                      FROM Questionnaires
                                                      WHERE SurveyName = '${msg[1]}')
                        `);
                    pool3.close();

                    // Extracting questions from the result and sending them to the client
                    const questions: string[] = [];
                    for (let i = 0; i < result3.recordset.length; i++) {
                        questions.push(result3.recordset[i].QuestionText);
                    }
                    ws.send(JSON.stringify(['SendQuestion', questions]));
                    break;

                // Handling request for answer options for a question
                case 'RequestForAnswerOptions':
                    const pool9 = await sql.connect(config);
                    const result9 = await pool9.request()
                        .query(`
                            SELECT OptionText
                            FROM AnswerOptions
                            WHERE question_id IN (SELECT id
                                                  FROM SurveyQuestions
                                                  WHERE questionnaire_id = (SELECT id
                                                                            FROM Questionnaires
                                                                            WHERE SurveyName = '${msg[1]}'))`
                        );
                    pool9.close();

                    // Extracting answer options from the result and sending them to the client
                    const answerOptions = [];
                    for (let i = 0; i < result9.recordset.length; i++) {
                        answerOptions.push(result9.recordset[i].OptionText);
                    }
                    ws.send(JSON.stringify(['SendAnswerOptions', answerOptions]));
                    break;

                case 'SendStudentAnswers':
                    const pool4 = await sql.connect(config);
                    const answersData = msg[1];
                    const surveyName = answersData[0];
                    const groupName = answersData[1];
                    const answers = answersData[2];

                    // Находим идентификатор анкеты по названию анкеты
                    const surveyQuery = await pool4.request()
                        .input('surveyName', sql.NVarChar, surveyName)
                        .query('SELECT id FROM Questionnaires WHERE SurveyName = @surveyName');
                    const questionnaireID = surveyQuery.recordset[0].id;

                    // Вставляем ответы студента в базу данных
                    const InsertQuery = await pool4.request()
                        .input('questionnaire_id', sql.Int, questionnaireID)
                        .input('groups', sql.VarChar, groupName)
                        .input('answers_json', sql.NVarChar, JSON.stringify(answers))
                        .query('INSERT INTO Answers (questionnaire_id, groups, answers_json) VALUES (@questionnaire_id, @groups, @answers_json)');

                    pool4.close();
                    break;

                case 'RequestForAnswers':
                    const surveyName1 = msg[1].name;
                    const group = msg[1].group;

                    // Query to fetch questionnaire_id based on survey name
                    const surveyQueryResult = await pool.request()
                        .input('surveyName', sql.NVarChar, surveyName1)
                        .query(`
                            SELECT Q.id as questionnaire_id
                            FROM Questionnaires Q
                            WHERE Q.SurveyName = @surveyName
                        `);

                    if (surveyQueryResult.recordset.length === 0) {
                        ws.send(JSON.stringify(['Error', 'No questionnaire or group found for the specified criteria']));
                        break;
                    }

                    const questionnaireId12 = surveyQueryResult.recordset[0].questionnaire_id;

                    // Query to fetch all answers based on questionnaire_id and group
                    const result = await pool.request()
                        .input('questionnaireId', sql.Int, questionnaireId12)
                        .input('groups', sql.VarChar, group)
                        .query(`
                            SELECT A.answers_json
                            FROM Answers A
                            WHERE A.questionnaire_id = @questionnaireId
                              AND A.groups = @groups
                        `);

                    // Extracting answers from the result and sending them to the client
                    if (result.recordset.length > 0) {
                        const answers = result.recordset.map(record => JSON.parse(record.answers_json));
                        ws.send(JSON.stringify(['Answers', answers]));
                    } else {
                        ws.send(JSON.stringify(['Error', 'No answers found for the specified criteria']));
                    }
                    break;



                // Handling reception of professor questionnaire
                case 'ReceiveProfessorQuestionnaire':
                    // Extracting data from the message
                    const formName = msg[1].formName;
                    const faculty = msg[1].faculty;
                    const groups = msg[1].groups;
                    const questionnaire = msg[1].questionnaire;

                    // Connect to the database to insert questionnaire details
                    const poolInsert = await sql.connect(config);
                    const insertQuery =
                        `
                            INSERT INTO Questionnaires (SurveyName, Faculty, Groups, ProfessorName, )
                            VALUES ('${formName}', '${faculty}','${JSON.stringify(groups)}', 'Admin')
                        `;
                    await poolInsert.request().query(insertQuery);
                    poolInsert.close();

                    // Fetching the questionnaire ID
                    const poolId = await sql.connect(config);
                    const idQuery =
                        `
                            SELECT id
                            FROM Questionnaires
                            WHERE SurveyName = '${formName}'
                        `;
                    const resultId = await poolId.request().query(idQuery);
                    const questionnaireId = resultId.recordset[0].id;
                    poolId.close();

                    // Inserting questions and answer options into the database
                    for (const question of questionnaire) {
                        const insertQuestionQuery =
                            `
                                INSERT INTO SurveyQuestions (questionnaire_id, QuestionText)
                                VALUES (${questionnaireId}, '${question.question}')
                            `;
                        const poolQuestion = await sql.connect(config);
                        await poolQuestion.request().query(insertQuestionQuery);
                        poolQuestion.close();

                        const poolQuestionId = await sql.connect(config);
                        const questionIdQuery =
                            `
                                SELECT id
                                FROM SurveyQuestions
                                WHERE questionnaire_id = ${questionnaireId}
                                  AND QuestionText = '${question.question}'
                            `;
                        const resultQuestionId = await poolQuestionId.request().query(questionIdQuery);
                        const questionId = resultQuestionId.recordset[0].id;
                        poolQuestionId.close();

                        for (const answer of question.answers) {
                            const insertAnswerQuery =
                                `
                                    INSERT INTO AnswerOptions (question_id, OptionText)
                                    VALUES (${questionId}, '${answer}')
                                `;
                            const poolAnswer = await sql.connect(config);
                            await poolAnswer.request().query(insertAnswerQuery);
                            poolAnswer.close();
                        }
                    }
                    break;

                // Handling user registration
                case 'Register':
                    const pool6 = await sql.connect(config);

                    // Check if the user already exists
                    const result6 = await pool6.request()
                        .query`
                        SELECT Login
                        FROM Accounts
                        WHERE Login = ${msg[1]}
                    `;

                    // Sending error message if user already exists, otherwise registering the user
                    if (result6.recordset.length > 0) {
                        ws.send(JSON.stringify(['Error', 'Пользователь уже существует']));
                    } else {
                        // Registering the user
                        const data6 = {
                            Login: msg[1],
                            Password: msg[2],
                        };

                        const result7 = await pool6.request()
                            .query`
                            INSERT INTO Accounts
                                (Login, Password)
                            VALUES (@Login, @Password)
                        `;

                        // Sending success or error response to the client
                        if (result7.rowsAffected[0] === 1) {
                            ws.send(JSON.stringify(['Success']));
                        } else {
                            ws.send(JSON.stringify(['Error', 'Ошибка добавления пользователя']));
                        }

                    }

                    pool6.close();

                    break;

                // Handling user login
                case 'Login':
                    const pool8 = await sql.connect(config);

                    // Query to check user credentials
                    const result8 = await pool8.request()
                        .query`
                        SELECT *
                        FROM Accounts
                        WHERE Login = ${msg[1]}
                          AND Password = ${msg[2]}
                    `;

                    // Sending success or error response to the client based on login status
                    if (result8.recordset.length > 0) {
                        ws.send(JSON.stringify(['Success']));
                    } else {
                        ws.send(JSON.stringify(['Error', 'Неверный логин или пароль']));
                    }

                    pool8.close();

                    break;

                case 'RequestForAvailableGroupsForQuestionnaire':
                    // Extracting questionnaire name from the message
                    const questionnaireName = msg[1];

                    // Connect to the database
                    const pool10 = await sql.connect(config);

                    // Query to fetch faculty and groups for the specified questionnaire
                    const result10 = await pool10.request()
                        .query(`
                            SELECT Faculty, Groups
                            FROM Questionnaires
                            WHERE SurveyName = '${questionnaireName}'
                        `);

                    pool10.close();

                    // Extracting faculty and groups from the result
                    const faculty10 = result10.recordset[0].Faculty;
                    const groups10 = JSON.parse(result10.recordset[0].Groups);

                    // Sending faculty and groups to the client
                    ws.send(JSON.stringify(['AvailableGroupsForQuestionnaire', {faculty10, groups10}]));

                    break;

            }
        } catch (err) {
            console.error('Error executing query', err);
            ws.send(JSON.stringify(['Error', 'An error occurred while processing your request']));
        }
    });

    // Event listener for connection close
    ws.on('close', () => {
        console.log('Connection closed');
    });
});

// Event listener for server error
server.on('error', (err) => {
    console.error('Server error', err);
});

// Event listener for process exit
process.on('exit', () => {
    pool.close();
    console.log('Connection pool closed');
});
