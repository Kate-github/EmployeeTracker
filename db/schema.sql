DROP DATABASE IF EXISTS emptracker_db;

CREATE DATABASE emptracker_db;

USE emptracker_db;

CREATE TABLE departments(
  id INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
  department_name VARCHAR(30) NOT NULL
);

CREATE TABLE roles(
  id INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(30) NOT NULL,
  salary DECIMAL(10, 2) NOT NULL,
  department_id INTEGER,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE
  SET
    NULL
);

CREATE TABLE employees(
  id INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
  firstName VARCHAR(30) NOT NULL,
  lastName VARCHAR(30) NOT NULL,
  role_id INTEGER,
  manager_id INTEGER,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE
  SET
    NULL
);