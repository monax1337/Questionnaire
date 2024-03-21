"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const sql = require("mssql");
const WebSocket = require("ws");
// Database configuration
const config = {
    user: 'questionnaires',
    password: 'pass123',
    server: 'localhost',
    database: 'Questionnaires',
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};
// WebSocket server setup
const server = new WebSocket.Server({ port: 8080 });
// Event listener for incoming connections
server.on('connection', (ws) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('connection');
    // Event listener for incoming messages
    ws.on('message', (message) => __awaiter(void 0, void 0, void 0, function* () {
        // Parsing incoming message as JSON
        const msg = JSON.parse(message);
        // Switch statement to handle different types of requests
        switch (msg[0]) {
            // Handling request for available groups
            case 'RequestForAvailableGroups':
                // Connect to the database
                const pool0 = yield sql.connect(config);
                // Query to fetch available groups
                const result0 = yield pool0.request()
                    .query(`
                        SELECT DISTINCT Faculty, Groups
                        FROM AvailableGroups
                    `);
                pool0.close();
                // Extracting available groups from the result and sending them to the client
                let availableGroupsObject = {};
                for (let i = 0; i < result0.recordset.length; i++) {
                    const faculty = result0.recordset[i].Faculty;
                    const groups = JSON.parse(result0.recordset[i].Groups);
                    availableGroupsObject[faculty] = groups;
                }
                ws.send(JSON.stringify(['AvailableGroups', availableGroupsObject]));
                break;
            // Handling request for questionnaires available to students
            case 'RequestForQuestionnaireStudent':
                const pool1 = yield sql.connect(config);
                const result1 = yield pool1.request()
                    .query(`
                        SELECT SurveyName
                        FROM Questionnaires
                        WHERE Groups = 'Все' OR Groups LIKE '%${msg[1]}%'
                    `);
                pool1.close();
                // Extracting available questionnaires for students and sending them to the client
                const questionnaires1 = [];
                for (let i = 0; i < result1.recordset.length; i++) {
                    questionnaires1.push(result1.recordset[i].SurveyName);
                }
                ws.send(JSON.stringify(['AvailableQuestionnaires', questionnaires1]));
                break;
            // Handling request for questionnaires available to professors
            case 'RequestForQuestionnairesProfessor':
                const pool2 = yield sql.connect(config);
                const result2 = yield pool2.request()
                    .query(`
                        SELECT SurveyName
                        FROM Questionnaires
                        WHERE ProfessorName = '${msg[1]}'
                    `);
                pool2.close();
                // Extracting available questionnaires for professors and sending them to the client
                const questionnaires2 = [];
                for (let i = 0; i < result2.recordset.length; i++) {
                    questionnaires2.push(result2.recordset[i].SurveyName);
                }
                ws.send(JSON.stringify(['AvailableQuestionnaires', questionnaires2]));
                break;
            // Handling request for questions in a questionnaire
            case 'RequestForQuestion':
                const pool3 = yield sql.connect(config);
                const result3 = yield pool3.request()
                    .query(`
                        SELECT QuestionText
                        FROM SurveyQuestions
                        WHERE questionnaire_id = (
                            SELECT id
                            FROM Questionnaires
                            WHERE SurveyName = '${msg[1]}'
                        )
                    `);
                pool3.close();
                // Extracting questions from the result and sending them to the client
                const questions = [];
                for (let i = 0; i < result3.recordset.length; i++) {
                    questions.push(result3.recordset[i].QuestionText);
                }
                ws.send(JSON.stringify(['SendQuestion', questions]));
                break;
            // Handling request for answer options for a question
            case 'RequestForAnswerOptions':
                const pool9 = yield sql.connect(config);
                const result9 = yield pool9.request()
                    .query(`
                        SELECT OptionText
                        FROM AnswerOptions
                        WHERE question_id IN (
                            SELECT id
                            FROM SurveyQuestions
                            WHERE questionnaire_id = (
                                SELECT id
                                FROM Questionnaires
                                WHERE SurveyName = '${msg[1]}'
                            )
                        )`);
                pool9.close();
                // Extracting answer options from the result and sending them to the client
                const answerOptions = [];
                for (let i = 0; i < result9.recordset.length; i++) {
                    answerOptions.push(result9.recordset[i].OptionText);
                }
                ws.send(JSON.stringify(['SendAnswerOptions', answerOptions]));
                break;
            // Handling submission of student answers
            case 'SendStudentAnswers':
                const pool4 = yield sql.connect(config);
                const answersData = msg[1];
                const surveyName = answersData[0];
                const groupName = answersData[1];
                const answers = answersData[2];
                // Query to insert student answers into the database
                const surveyQuery = yield pool4.request()
                    .input('surveyName', sql.NVarChar, surveyName)
                    .query('SELECT id FROM Questionnaires WHERE SurveyName = @surveyName');
                const questionnaireId1 = surveyQuery.recordset[0].id;
                const groupQuery = yield pool4.request()
                    .input('groupName', sql.NVarChar, groupName)
                    .query('SELECT id FROM AvailableGroups WHERE Groups LIKE @groupName');
                const groupId = groupQuery.recordset[0].id;
                const insertQuery1 = yield pool4.request()
                    .input('questionnaire_id', sql.Int, questionnaireId1)
                    .input('group_id', sql.Int, groupId)
                    .input('answers_json', sql.NVarChar, JSON.stringify(answers))
                    .query('INSERT INTO Answers (questionnaire_id, group_id, answers_json) VALUES (@questionnaire_id, @group_id, @answers_json)');
                // Sending success or error response to the client
                if (insertQuery1.rowsAffected[0] === 1) {
                    ws.send(JSON.stringify(['Success']));
                }
                else {
                    ws.send(JSON.stringify(['Error', 'Ошибка отправки ответов']));
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
                const poolInsert = yield sql.connect(config);
                const insertQuery = `
                        INSERT INTO Questionnaires (SurveyName, Groups, ProfessorName, Faculty)
                        VALUES ('${formName}', '${JSON.stringify(groups)}', 'Admin', '${faculty}')
                    `;
                yield poolInsert.request().query(insertQuery);
                poolInsert.close();
                // Fetching the questionnaire ID
                const poolId = yield sql.connect(config);
                const idQuery = `
                        SELECT id
                        FROM Questionnaires
                        WHERE SurveyName = '${formName}'
                    `;
                const resultId = yield poolId.request().query(idQuery);
                const questionnaireId = resultId.recordset[0].id;
                poolId.close();
                // Inserting questions and answer options into the database
                for (const question of questionnaire) {
                    const insertQuestionQuery = `
                            INSERT INTO SurveyQuestions (questionnaire_id, QuestionText)
                            VALUES (${questionnaireId}, '${question.question}')
                        `;
                    const poolQuestion = yield sql.connect(config);
                    yield poolQuestion.request().query(insertQuestionQuery);
                    poolQuestion.close();
                    const poolQuestionId = yield sql.connect(config);
                    const questionIdQuery = `
                            SELECT id
                            FROM SurveyQuestions
                            WHERE questionnaire_id = ${questionnaireId} AND QuestionText = '${question.question}'
                        `;
                    const resultQuestionId = yield poolQuestionId.request().query(questionIdQuery);
                    const questionId = resultQuestionId.recordset[0].id;
                    poolQuestionId.close();
                    for (const answer of question.answers) {
                        const insertAnswerQuery = `
                                INSERT INTO AnswerOptions (question_id, OptionText)
                                VALUES (${questionId}, '${answer}')
                            `;
                        const poolAnswer = yield sql.connect(config);
                        yield poolAnswer.request().query(insertAnswerQuery);
                        poolAnswer.close();
                    }
                }
                break;
            // Handling user registration
            case 'Register':
                const pool6 = yield sql.connect(config);
                // Check if the user already exists
                const result6 = yield pool6.request()
                    .query `
                    SELECT Login
                    FROM Accounts
                    WHERE Login = ${msg[1]}
                `;
                // Sending error message if user already exists, otherwise registering the user
                if (result6.recordset.length > 0) {
                    ws.send(JSON.stringify(['Error', 'Пользователь уже существует']));
                }
                else {
                    // Registering the user
                    const data6 = {
                        Login: msg[1],
                        Password: msg[2],
                    };
                    const result7 = yield pool6.request()
                        .query `
                        INSERT INTO Accounts
                            (Login, Password)
                        VALUES (@Login, @Password)
                    `;
                    // Sending success or error response to the client
                    if (result7.rowsAffected[0] === 1) {
                        ws.send(JSON.stringify(['Success']));
                    }
                    else {
                        ws.send(JSON.stringify(['Error', 'Ошибка добавления пользователя']));
                    }
                }
                pool6.close();
                break;
            // Handling user login
            case 'Login':
                const pool8 = yield sql.connect(config);
                // Query to check user credentials
                const result8 = yield pool8.request()
                    .query `
                    SELECT *
                    FROM Accounts
                    WHERE Login = ${msg[1]}
                      AND Password = ${msg[2]}
                `;
                // Sending success or error response to the client based on login status
                if (result8.recordset.length > 0) {
                    ws.send(JSON.stringify(['Success']));
                }
                else {
                    ws.send(JSON.stringify(['Error', 'Неверный логин или пароль']));
                }
                pool8.close();
                break;
        }
    }));
}));
