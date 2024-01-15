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
    user: 'username',
    password: 'password',
    server: 'localhost',
    database: 'questionnaires',
};
const server = new WebSocket.Server({ port: 8080 });
server.on('connection', (ws) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('connection');
    ws.on('message', (message) => __awaiter(void 0, void 0, void 0, function* () {
        const msg = JSON.parse(message);
        switch (msg[0]) {
            case 'RequestForQuestionnaireStudent':
                const pool1 = yield sql.connect(config);
                const result1 = yield pool1.request()
                    .query(`
                        SELECT QuestionnairesName, Groups
                        FROM questionnairesdata
                    `);
                pool1.close();
                let groupsArray = [];
                const questionnaires1 = [];
                for (let i = 0; i < result1.recordset.length; i++) {
                    if (result1.recordset[i].Groups === 'Все') {
                        questionnaires1.push(result1.recordset[i].QuestionnairesName);
                    }
                    else {
                        groupsArray = JSON.parse(result1.recordset[i].Groups);
                        if (groupsArray.includes(msg[1])) {
                            questionnaires1.push(result1.recordset[i].QuestionnairesName);
                        }
                    }
                }
                ws.send(JSON.stringify(['AvailableQuestionnaires', questionnaires1]));
                break;
            case 'RequestForQuestionnairesProfessor':
                const pool2 = yield sql.connect(config);
                const result2 = yield pool2.request()
                    .query(`
                        SELECT QuestionnairesName
                        FROM questionnairesdata
                        WHERE ProfessorName = '${msg[1]}'
                    `);
                pool2.close();
                const questionnaires2 = [];
                for (let i = 0; i < result2.recordset.length; i++) {
                    questionnaires2.push(result2.recordset[i].QuestionnairesName);
                }
                ws.send(JSON.stringify(['AvailableQuestionnaires', questionnaires2]));
                break;
            case 'RequestForQuestion':
                const pool3 = yield sql.connect(config);
                const result3 = yield pool3.request()
                    .query(`
                        SELECT Questions, Answers
                        FROM Questionnairesdata
                        WHERE QuestionnairesName = '${msg[1]}'
                    `);
                pool3.close();
                const questions = [];
                const answers = [];
                for (let i = 0; i < result3.recordset.length; i++) {
                    const arr1 = result3.recordset[i].Questions.split('~');
                    const arr2 = result3.recordset[i].Answers.split('~');
                    questions.push(...arr1);
                    answers.push(...arr2);
                }
                ws.send(JSON.stringify(['SendQuestion', questions, answers]));
                break;
            case 'SendStudentAnswer':
                const pool4 = yield sql.connect(config);
                const data4 = {
                    QuestionnairesName: msg[3],
                    GroupNumber: msg[2],
                    Answers: JSON.stringify(msg[1]),
                };
                const result4 = yield pool4.request()
                    .query `
                    INSERT INTO studentanswers
                        (QuestionnairesName, GroupNumber, Answers)
                    VALUES (@QuestionnairesName, @GroupNumber, @Answers)
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
                const pool5 = yield sql.connect(config);
                const data5 = {
                    QuestionnairesName: msg[1],
                    Questions: msg[2],
                    Answers: msg[3],
                    Groups: msg[4],
                    ProfessorName: msg[5],
                };
                const result5 = yield pool5.request()
                    .query `
                    INSERT INTO Questionnairesdata
                        (QuestionnairesName, Questions, Answers, Groups, ProfessorName)
                    VALUES (@QuestionnairesName, @Questions, @Answers, @Groups, @ProfessorName)
                `;
                pool5.close();
                if (result5.rowsAffected[0] === 1) {
                    ws.send(JSON.stringify(['Success']));
                }
                else {
                    ws.send(JSON.stringify(['Error', 'Ошибка отправки анкеты']));
                }
                break;
            case 'Register':
                const pool6 = yield sql.connect(config);
                const result6 = yield pool6.request()
                    .query `
                    SELECT login
                    FROM accounts
                    WHERE login = ${msg[1]}
                `;
                if (result6.recordset.length > 0) {
                    ws.send(JSON.stringify(['Error', 'Пользователь уже существует']));
                }
                else {
                    const data6 = {
                        login: msg[1],
                        password: msg[2],
                    };
                    const result7 = yield pool6.request()
                        .query `
                        INSERT INTO Accounts
                            (login, password)
                        VALUES (@login, @password)
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
                    FROM accounts
                    WHERE login = ${msg[1]}
                      AND password = ${msg[2]}
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
