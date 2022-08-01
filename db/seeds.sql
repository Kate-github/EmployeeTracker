INSERT INTO departments (department_name) 
VALUES
  ("HR"),
  ("Sales"),
  ("Customer Service"),
  ("Management"),
  ("Marketing"),
  ("Accounting"),
  ("Operations"),
  ("IT");

INSERT INTO roles(title, salary, department_id)
VALUES
    ("Sales Associate",30000, 2),
    ("Sales Manager", 50000, 4),
    ("Web Developer", 70000, 8);

INSERT INTO employees(firstName, lastName, role_id, manager_id)
VALUES
  ("Kate", "Thao", 3, NULL),
  ("Kate", "Lam", 2, 1),
  ("Thao","Lam", 2, 1);
