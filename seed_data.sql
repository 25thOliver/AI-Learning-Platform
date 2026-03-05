-- Students
INSERT INTO students (first_name, second_name, email) VALUES
('Alice',   'Mwangi',  'alice@school.com'),
('Brian',   'Otieno',  'brian@school.com'),
('Cynthia', 'Kamau',   'cynthia@school.com');

-- Topics
INSERT INTO topics (name, description) VALUES
('Algebra',        'Equations, expressions and variables'),
('Biology',        'Living organisms and life processes'),
('Python Basics',  'Introduction to programming with Python');

-- Quizzes (one per topic, each difficulty)
INSERT INTO quizzes (topic_id, question, correct_answer, difficulty) VALUES
(1, 'What is 2x = 10? Solve for x.', '5', 'easy'),
(1, 'Expand (x+2)(x-3).', 'x^2 - x - 6', 'hard'),
(2, 'What is the powerhouse of the cell?', 'mitochondria', 'easy'),
(2, 'What process do plants use to make food?', 'photosynthesis', 'medium'),
(3, 'What keyword is used to define a function in Python?', 'def', 'easy'),
(3, 'What does len() return?', 'the number of items in an object', 'medium');

-- Quiz Attempts (simulating 3 students over time with improving scores)
-- Alice: improving trend in Algebra
INSERT INTO quiz_attempts (student_id, quiz_id, submitted_answer, is_correct, score, time_spent, created_at) VALUES
(1, 1, '4',  false, 0.0,  45.0, '2025-01-10 09:00:00'),
(1, 1, '5',  true,  100.0, 30.0, '2025-01-15 09:00:00'),
(1, 2, 'x^2 - x - 6', true, 100.0, 60.0, '2025-01-20 09:00:00');

-- Brian: struggling (low scores across topics)
INSERT INTO quiz_attempts (student_id, quiz_id, submitted_answer, is_correct, score, time_spent, created_at) VALUES
(2, 3, 'nucleus',       false, 0.0,  50.0, '2025-01-11 10:00:00'),
(2, 4, 'respiration',   false, 0.0,  55.0, '2025-01-16 10:00:00'),
(2, 5, 'function',      false, 0.0,  40.0, '2025-01-21 10:00:00');

-- Cynthia: good performance
INSERT INTO quiz_attempts (student_id, quiz_id, submitted_answer, is_correct, score, time_spent, created_at) VALUES
(3, 3, 'mitochondria',             true,  100.0, 20.0, '2025-01-12 11:00:00'),
(3, 4, 'photosynthesis',           true,  100.0, 25.0, '2025-01-17 11:00:00'),
(3, 5, 'def',                      true,  100.0, 15.0, '2025-01-22 11:00:00'),
(3, 6, 'the number of items in an object', true, 100.0, 30.0, '2025-01-27 11:00:00');

-- Performance logs (summary per student)
INSERT INTO performance_logs (student_id, average_score, total_attempts) VALUES
(1, 66.67, 3),
(2, 0.0,   3),
(3, 100.0, 4);