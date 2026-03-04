INSERT INTO students (first_name, second_name, email)
VALUES
('John', 'Doe', 'john@example.com'),
('Jane', 'Smith', 'jane@example.com');

INSERT INTO topics (name, description)
VALUES
('Mathematics', 'Basic math concepts'),
('Science', 'General science');

INSERT INTO quizzes (topic_id, question, correct_answer, difficulty)
VALUES
(1, 'What is 2 + 2?', '4', 'easy'),
(2, 'What planet is known as the Red Planet?', 'Mars', 'easy');