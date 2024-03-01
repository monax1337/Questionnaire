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
const server = new WebSocket.Server({ port: 8080 });
server.on('connection', (ws) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('connection');
    ws.on('message', (message) => __awaiter(void 0, void 0, void 0, function* () {
        const msg = JSON.parse(message);
        switch (msg[0]) {
            case 'RequestForAvailableGroups':
                const pool0 = yield sql.connect(config);
                const result0 = yield pool0.request()
                    .query(`
                        SELECT *
                        FROM AvailableGroups
                    `);
                pool0.close();
                let availableGroupsArray = [];
                for (let i = 0; i < result0.recordset.length; i++) {
                    availableGroupsArray.push(result0.recordset[i].Groups);
                }
                ws.send(JSON.stringify(['AvailableGroups', availableGroupsArray]));
                break;
            case 'RequestForQuestionnaireStudent':
                const pool1 = yield sql.connect(config);
                const result1 = yield pool1.request()
                    .query(`
                        SELECT SurveyName
                        FROM Questionnaires
                        WHERE Groups = 'Все' OR Groups LIKE '%${msg[1]}%'
                    `);
                pool1.close();
                const questionnaires1 = [];
                for (let i = 0; i < result1.recordset.length; i++) {
                    questionnaires1.push(result1.recordset[i].SurveyName);
                }
                ws.send(JSON.stringify(['AvailableQuestionnaires', questionnaires1]));
                break;
            case 'RequestForQuestionnairesProfessor':
                const pool2 = yield sql.connect(config);
                const result2 = yield pool2.request()
                    .query(`
                        SELECT SurveyName
                        FROM Questionnaires
                        WHERE ProfessorName = '${msg[1]}'
                    `);
                pool2.close();
                const questionnaires2 = [];
                for (let i = 0; i < result2.recordset.length; i++) {
                    questionnaires2.push(result2.recordset[i].SurveyName);
                }
                ws.send(JSON.stringify(['AvailableQuestionnaires', questionnaires2]));
                break;
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
                const questions = [];
                for (let i = 0; i < result3.recordset.length; i++) {
                    questions.push(result3.recordset[i].QuestionText);
                }
                ws.send(JSON.stringify(['SendQuestion', questions]));
                break;
            case 'SendStudentAnswer':
                const pool4 = yield sql.connect(config);
                const data4 = {
                    questionnaire_id: (yield pool4.request()
                        .query(`
                                SELECT id
                                FROM Questionnaires
                                WHERE SurveyName = '${msg[3]}'
                            `)).recordset[0].id,
                    group_id: (yield pool4.request()
                        .query(`
                                SELECT id
                                FROM AvailableGroups
                                WHERE Groups LIKE '%${msg[2]}%'
                            `)).recordset[0].id,
                    question_id: msg[4],
                    answer_id: msg[5],
                    answers_json: JSON.stringify(msg[1])
                };
                const result4 = yield pool4.request()
                    .query `
                    INSERT INTO Answers
                        (questionnaire_id, group_id, question_id, answer_id, answers_json)
                    VALUES (@questionnaire_id, @group_id, @question_id, @answer_id, @answers_json)
                `;
                pool4.close();
                if (result4.rowsAffected[0] === 1) {
                    ws.send(JSON.stringify(['Success']));
                }
                else {
                    ws.send(JSON.stringify(['Error', 'Ошибка отправки ответов']));
                }
                break;
            case 'ReceiveProfessorQuestionnaire':
                const formName = msg[1].formName;
                const faculty = msg[1].faculty;
                const groups = msg[1].groups;
                const questionnaire = msg[1].questionnaire;
                // Вставка информации о форме анкеты в таблицу Questionnaires
                const poolInsert = yield sql.connect(config);
                const insertQuery = `
        INSERT INTO Questionnaires (SurveyName, Groups, ProfessorName, Faculty)
        VALUES ('${formName}', '${JSON.stringify(groups)}', 'Admin', '${faculty}')
    `;
                yield poolInsert.request().query(insertQuery);
                poolInsert.close();
                // Получение идентификатора вставленной анкеты
                const poolId = yield sql.connect(config);
                const idQuery = `
        SELECT id
        FROM Questionnaires
        WHERE SurveyName = '${formName}'
    `;
                const resultId = yield poolId.request().query(idQuery);
                const questionnaireId = resultId.recordset[0].id;
                poolId.close();
                // Вставка вопросов анкеты в таблицу SurveyQuestions
                for (const question of questionnaire) {
                    const insertQuestionQuery = `
            INSERT INTO SurveyQuestions (questionnaire_id, QuestionText)
            VALUES (${questionnaireId}, '${question.question}')
        `;
                    const poolQuestion = yield sql.connect(config);
                    yield poolQuestion.request().query(insertQuestionQuery);
                    poolQuestion.close();
                    // Получение идентификатора вставленного вопроса
                    const poolQuestionId = yield sql.connect(config);
                    const questionIdQuery = `
            SELECT id
            FROM SurveyQuestions
            WHERE questionnaire_id = ${questionnaireId} AND QuestionText = '${question.question}'
        `;
                    const resultQuestionId = yield poolQuestionId.request().query(questionIdQuery);
                    const questionId = resultQuestionId.recordset[0].id;
                    poolQuestionId.close();
                    // Вставка вариантов ответов в таблицу AnswerOptions
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
            case 'Register':
                const pool6 = yield sql.connect(config);
                const result6 = yield pool6.request()
                    .query `
                    SELECT Login
                    FROM Accounts
                    WHERE Login = ${msg[1]}
                `;
                if (result6.recordset.length > 0) {
                    ws.send(JSON.stringify(['Error', 'Пользователь уже существует']));
                }
                else {
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
                    if (result7.rowsAffected[0] === 1) {
                        ws.send(JSON.stringify(['Success']));
                    }
                    else {
                        ws.send(JSON.stringify(['Error', 'Ошибка добавления пользователя']));
                    }
                }
                pool6.close();
                break;
            case 'Login':
                const pool8 = yield sql.connect(config);
                const result8 = yield pool8.request()
                    .query `
                    SELECT *
                    FROM Accounts
                    WHERE Login = ${msg[1]}
                      AND Password = ${msg[2]}
                `;
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
