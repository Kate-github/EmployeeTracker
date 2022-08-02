const { welcomeMessage } = require('./constants');
const inquirer = require('inquirer');
const fs = require('fs');
const mysql = require('mysql2');
require('console.table');
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'mysql!408TNL',
        database: 'emptracker_db'
    },
    console.log(`Connected to the emptracker_db database.`)
);

function main() {
    // console.log(welcomeMessage);
    showMainMenu()
}

function showMainMenu() {
    const mainMenu = JSON.parse(fs.readFileSync('./questions/main-menu.json'));
    inquirer.prompt(mainMenu).then(answers => processMainMenu(answers));
}

function processMainMenu(answers) {
    switch (answers.whatToDo) {
        case "show-depts":
            showDepts();
            break;
        case "show-roles":
            showRoles();
            break;
        case "show-emps":
            showEmps();
            break;
        case "add-role":
            addRole();
            break;
        case "add-dept":
            addDepartment();
            break;
        case "add-emp":
            addEmployee();
            break;
        case "update-emp-role":
            updateEmployeeRole();
            break;
        default:
            process.exit();
            return;
    }
}

function showDepts() {
    db.query('SELECT * FROM departments', function (err, results) {
        if (err) {
            console.log(err);
            return;
        }
        console.table(results);
        showMainMenu();
    });
}

function showRoles() {
    db.query('SELECT * FROM roles', function (err, results) {
        if (err) {
            console.log(err);
            return;
        }
        console.table(results);
        showMainMenu();
    });
}

function showEmps() {
    db.query('SELECT * FROM employees', function (err, results) {
        if (err) {
            console.log(err);
            return;
        }
        console.table(results);
        showMainMenu();
    });
}

function addDepartment() {
    const deptQuestions = JSON.parse(fs.readFileSync('./questions/department.json'));
    inquirer.prompt(deptQuestions).then(answer => createDepartment(answer))
}

function addRole() {

    const roleQuestions = JSON.parse(fs.readFileSync('./questions/role.json'));
    db.query('SELECT id, department_name FROM departments', (err, results) => {
        results.forEach((dept) => {
            roleQuestions[2].choices.push({
                name: dept.department_name,
                value: dept.id
            });
        });
        inquirer.prompt(roleQuestions).then(answers => createRole(answers));
    });
}

function createDepartment(dept) {
    db.query(
        `INSERT INTO departments (department_name) VALUES (?)`,
        [dept.department],
        (err, result) => {
            const msg = (err) ? 'There was an error, department not added to database.' :
                'Departmnet successfully added to database.'
            console.log(msg);
            showMainMenu();
        }
    )
};

function createRole(role) {
    db.query(
        `INSERT INTO roles (title, salary, department_id) VALUES (?,?,?)`,
        [role.title, role.salary, role.department_id],
        (err, results) => {
            const msg = (err) ? 'There was an error, role not added to database.' :
                'Role successfully added to database.'
            console.log(msg);
            showMainMenu();
        });
}

function addEmployee() {
    const empQuestions = JSON.parse(fs.readFileSync('./questions/employee.json'));
    db.query(
        'SELECT id, title FROM roles',
        (err, results) => {
            results.forEach((role) => {
                empQuestions[2].choices.push({
                    name: role.title,
                    value: role.id
                });
            });
            db.query(
                'SELECT id, firstName, lastName FROM employees',
                (err, results) => {
                    results.forEach((emp) => {
                        empQuestions[3].choices.push({
                            name: `${emp.firstName} ${emp.lastName}`,
                            value: emp.id
                        });

                    });
                    inquirer.prompt(empQuestions).then(answers => createEmployee(answers));
                }
            )
        });
}

function createEmployee(emp) {
    db.query(
        `INSERT INTO employees (firstName, lastName, role_id, manager_id) VALUES (?,?,?,?)`,
        [emp.firstName, emp.lastName, emp.role_id, emp.manager_id],
        (err, result) => {
            const msg = (err) ? 'There was an error, employee not added to database.' :
                'Employee successfully added to database.'
            console.log(msg);
            showMainMenu();
        }
    )
}

function updateEmployeeRole() {
    const selectEmpQuestion = JSON.parse(fs.readFileSync('./questions/select-employee.json'));
    db.query(
        'SELECT firstName, lastName, id, role_id FROM Employees',
        (err, results) => {
            if (err) {
                console.log('An error occured while retrieving the list of employees');
                return;
            }
            results.forEach((emp) => {
                selectEmpQuestion.choices.push({
                    name: `${emp.firstName} ${emp.lastName}`,
                    value: emp.id
                })
            });
            inquirer.prompt(selectEmpQuestion).then((empAnswer) => {
                const selectedEmployee = results.filter((emp) => {
                    return emp.id === empAnswer.id
                });
                console.log('selected:', selectedEmployee);
                db.query(
                    `SELECT id, title FROM roles WHERE id <> ${selectedEmployee[0].role_id}`,
                    (err, roleResults) => {
                        const selectRoleQuestion = JSON.parse(fs.readFileSync('./questions/select-role.json'));
                        roleResults.forEach(role => {
                            selectRoleQuestion.choices.push({
                                name: role.title,
                                value: role.id
                            })
                        });
                        inquirer.prompt(selectRoleQuestion).then((answer) => {
                            db.query(
                                `UPDATE employees
                            SET role_id = ${answer.role_id}
                            WHERE id = ${selectedEmployee[0].id};`,
                                (err, result) => {
                                    if (result) {
                                        console.log(`Succesfully updated ${selectedEmployee[0].firstName}'s role`);
                                    } else {
                                        console.log('There was an error updating the employee\'s role.');
                                    }
                                    showMainMenu();
                                }
                            )
                        });
                    }
                )
            });
        }
    )
}
main();