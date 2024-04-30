IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'Questionnaires')
BEGIN
    CREATE DATABASE Questionnaires
    COLLATE Cyrillic_General_CI_AI
END
GO

USE Questionnaires
GO

CREATE TABLE Questionnaires (
                                id INT IDENTITY PRIMARY KEY,
                                SurveyName varchar(255),
                                Faculty varchar(MAX),
                                Groups varchar(MAX),
    ProfessorName varchar(255)
)

    INSERT INTO Questionnaires(SurveyName,Faculty, Groups, ProfessorName)
    VALUES ('Уровень удовлетворенности студентов','ФИТР' ,'["10701123","10701223","10701323","10701122","10701222","10701322","10701121","10701221","10701321","10701421"]', 'Admin')


CREATE TABLE SurveyQuestions (
                                 id INT IDENTITY PRIMARY KEY,
                                 questionnaire_id INT,
                                 QuestionText NVARCHAR(MAX),
                                 FOREIGN KEY (questionnaire_id) REFERENCES Questionnaires(id)
)


CREATE TABLE AnswerOptions (
                               id INT IDENTITY PRIMARY KEY,
                               question_id INT,
                               OptionText NVARCHAR(MAX),
                               FOREIGN KEY (question_id) REFERENCES SurveyQuestions(id)
)


-- Вставка данных в SurveyQuestions
    INSERT INTO SurveyQuestions(questionnaire_id, QuestionText)
VALUES (1, 'Уровень теоретической подготовки'),
       (1, 'Уровень практической подготовки'),
       (1, 'Уровень и возможность освоения дополнительных знаний и умений; владение современными информационными технологиями, владение иностранными языками и др.'),
       (1, 'Обеспеченность образовательного процесса учебными и учебно-методическими пособиями'),
       (1, 'Доступность в Научной библиотеке БНТУ электронных ресурсов по тематике обучения'),
       (1, 'Обеспеченность образовательного процесса учебной материально-технической базой (оборудованием)'),
       (1, 'Уровень организации контроля и оценки знаний'),
       (1, 'Содержание и организация общественных, культурно-массовых, спортивных и др. мероприятий')


-- Вставка данных в AnswerOptions
INSERT INTO AnswerOptions(question_id, OptionText)
VALUES (1, 'Полностью удовлетворен'),
       (1, 'Скорее удовлетворен, чем не удовлетворен'),
       (1, 'Скорее не удовлетворен, чем удовлетворен'),
       (1, 'Полностью не удовлетворен')


CREATE TABLE Accounts (
                          id INT IDENTITY PRIMARY KEY,
                          Login varchar(255),
                          Password varchar(255)
)

    INSERT INTO Accounts(Login, Password)
VALUES ('Admin', 'pass123')


CREATE TABLE AvailableGroups (
                                 id INT IDENTITY PRIMARY KEY,
                                 Faculty varchar(20),
                                 Groups varchar(MAX)
    )

    INSERT INTO AvailableGroups(Faculty, Groups)
VALUES ('ФИТР', '["10701123","10701223","10701323","10701122","10701222","10701322","10701121","10701221","10701321","10701421"]')


CREATE TABLE Answers (
                         id INT IDENTITY PRIMARY KEY,
                         questionnaire_id INT,
                         groups VARCHAR(20),
                         answers_json NVARCHAR(MAX),
                         FOREIGN KEY (questionnaire_id) REFERENCES Questionnaires(id)
)


-- Вставка данных в Answers с массивом ответов
    INSERT INTO Answers (questionnaire_id, groups, answers_json)
VALUES (1, '10701321', '[["1","0","0","0"],["1","0","0","0"],["1","0","0","0"],["1","0","0","0"],["1","0","0","0"],["1","0","0","0"],["1","0","0","0"],["1","0","0","0"]')
