-- SQL PRACTICE: Creating and Using a FULL_NAME Column

-- Step 1: Create the employees table
CREATE TABLE employees (
    id         SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    second_name VARCHAR(100) NOT NULL,
    salary     DECIMAL(10, 2),
    country    VARCHAR(100)
);

-- Step 2: Insert sample data
INSERT INTO employees (first_name, second_name, salary, country) VALUES
('Alice',   'Mwangi',   55000.00, 'Kenya'),
('Brian',   'Otieno',   42000.00, 'Kenya'),
('Cynthia', 'Kamau',    61000.00, 'Uganda'),
('David',   'Njoroge',  38000.00, 'Tanzania'),
('Esther',  'Wanjiru',  72000.00, 'Kenya');

-- Step 3: SELECT using CONCAT to combine first and second name
SELECT
    id,
    CONCAT(first_name, ' ', second_name) AS full_name,
    salary,
    country
FROM employees;

-- Step 4: Add a permanent FULL_NAME column to the table
ALTER TABLE employees
ADD COLUMN full_name VARCHAR(200);

-- Step 5: Populate the FULL_NAME column using UPDATE
UPDATE employees
SET full_name = CONCAT(first_name, ' ', second_name);

-- Step 6: Verify the result
SELECT id, full_name, salary, country FROM employees;


-- BONUS ANALYTICS ON EMPLOYEES TABLE

-- Average salary by country
SELECT country, ROUND(AVG(salary), 2) AS avg_salary
FROM employees
GROUP BY country
ORDER BY avg_salary DESC;

-- Employees earning above average salary
SELECT full_name, salary, country
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);
