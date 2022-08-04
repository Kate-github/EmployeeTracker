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
const welcomeMessage = fs.readFileSync('./welcome-msg.txt', { encoding: 'ascii' });
function main() {
    console.log(welcomeMessage);
    showMainMenu()
}

/**
 * displays main menu choices
 */
function showMainMenu() {
    const mainMenu = JSON.parse(fs.readFileSync('./questions/main-menu.json'));
    inquirer.prompt(mainMenu).then(answers => processMainMenu$(answers));
}

/**
 * a function that decides what actions to take when the user makes a selection
 */
async function processMainMenu$(answers) {
    switch (answers.whatToDo) {
        case "show-depts":
            await showResultsInTable$('SELECT * FROM departments');
            showMainMenu();
            break;
        case "show-roles":
            await showResultsInTable$('SELECT * FROM roles');
            showMainMenu();
            break;
        case "show-emps":
            await showResultsInTable$('SELECT * FROM employees');
            showMainMenu();
            break;
        case "show-all":
            await showAll$();
            showMainMenu();
            break;
        case "add-role":
            await addRole$();
            showMainMenu();
            break;
        case "add-dept":
            await addDepartment$();
            showMainMenu();
            break;
        case "add-emp":
            await addEmployee$();
            showMainMenu();
            break;
        case "update-emp-role":
            await updateEmployeeRole$();
            showMainMenu();
            break;
        default:
            process.exit();
    }
}
/**
 * Displays the results of a SQL statement in a formatted table
 * @param {string} query 
 */
async function showResultsInTable$(query) {
    const results = await queryDatabase$(query);
    console.table(results);
}

/**
 * Executes a SQL query and returns the result as a Promise
 * @param {string} query 
 * @returns Promise
 */
async function queryDatabase$(query) {
    return new Promise((resolve, reject) => {
        db.query(query, function (err, results) {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}
/**
 * Displays all records in all tables in the database;
 */
async function showAll$() {
    await showResultsInTable$('SELECT * from departments');
    await showResultsInTable$('SELECT * from roles');
    await showResultsInTable$('SELECT * from employees');
}

/**
 * 
 * @returns Adds a new department into Departments table
 */
function addDepartment$() {
    const deptQuestions = JSON.parse(fs.readFileSync('./questions/department.json'));
    return inquirer.prompt(deptQuestions).then(answer => createDepartment$(answer))
}

/**
 * 
 * @returns Adds new role in roles table
 */
async function addRole$() {

    const roleQuestions = JSON.parse(fs.readFileSync('./questions/role.json'));
    // Select all departments
    const results = await queryDatabase$('SELECT id, department_name FROM departments');

    // append department to choices array
    results.forEach((dept) => {
        roleQuestions[2].choices.push({
            name: dept.department_name,
            value: dept.id
        });
    });

    // prompt the user to enter details for new role
    return inquirer.prompt(roleQuestions).then(answers => createRole$(answers));
}

function createDepartment$(dept) {
    return new Promise((resolve, reject) => {

        db.query(
            `INSERT INTO departments (department_name) VALUES (?)`,
            [dept.department],
            (err, result) => {
                const msg = (err) ? 'There was an error, department not added to database.' :
                    'Departmnet successfully added to database.';
                console.log(msg);
                if (err) {
                    reject(msg);
                } else {
                    resolve(msg);
                }
            }
        )
    });
};

function createRole$(role) {
    return new Promise((resolve, reject) => {
        // Inserts role into Roles table
        db.query(
            `INSERT INTO roles (title, salary, department_id) VALUES (?,?,?)`,
            [role.title, role.salary, role.department_id],
            (err, results) => {
                const msg = (err) ? 'There was an error, role not added to database.' :
                    'Role successfully added to database.'
                console.log(msg);
                if (err) {
                    reject(msg);
                } else {
                    resolve(msg);
                }
            });
    });
}

async function addEmployee$() {
    const empQuestions = JSON.parse(fs.readFileSync('./questions/employee.json'));
    // select roles from database
    const roles = await queryDatabase$('SELECT id, title FROM roles');

    // append to choices
    roles.forEach((role) => {
        empQuestions[2].choices.push({
            name: role.title,
            value: role.id
        });
    });

    // select all employess
    const managers = await queryDatabase$('SELECT id, firstName, lastName FROM employees');

    // append employees to manager choices
    managers.forEach((emp) => {
        empQuestions[3].choices.push({
            name: `${emp.firstName} ${emp.lastName}`,
            value: emp.id
        });
    });

    // prompt user to enter new employee details 
    return inquirer.prompt(empQuestions).then(answers => createEmployee$(answers));
}

function createEmployee$(emp) {

    return new Promise((resolve, reject) => {
        // inserts new record in employees table
        db.query(
            `INSERT INTO employees (firstName, lastName, role_id, manager_id) VALUES (?,?,?,?)`,
            [emp.firstName, emp.lastName, emp.role_id, emp.manager_id],
            (err, result) => {
                const msg = (err) ? 'There was an error, employee not added to database.' :
                    'Employee successfully added to database.';
                console.log(msg);
                if (err) {
                    reject(msg);
                } else {
                    resolve(msg);
                }
            }
        )
    });
}

async function updateEmployeeRole$() {

    const selectEmpQuestion = JSON.parse(fs.readFileSync('./questions/select-employee.json'));

    // select all employees 
    const employees = await queryDatabase$('SELECT firstName, lastName, id, role_id FROM Employees');

    // then append the employess to the choices
    employees.forEach((emp) => {
        selectEmpQuestion.choices.push({
            name: `${emp.firstName} ${emp.lastName}`,
            value: emp.id
        });
    });

    // prompt user to select employee to update
    const empAnswer = await inquirer.prompt(selectEmpQuestion);

    // find the selected employee from the list of employees
    const selectedEmployee = employees.filter((emp) => {
        return emp.id === empAnswer.id
    });


    // select all roles that do not match the select employee's role
    const roleResults = await queryDatabase$(`SELECT id, title FROM roles WHERE id <> ${selectedEmployee[0].role_id}`);

    // append to choices
    const selectRoleQuestion = JSON.parse(fs.readFileSync('./questions/select-role.json'));
    roleResults.forEach(role => {
        selectRoleQuestion.choices.push({
            name: role.title,
            value: role.id
        })
    });

    // prompt user to select new role
    const answer = await inquirer.prompt(selectRoleQuestion)

    // update user in database
    const result = await queryDatabase$(`UPDATE employees
    SET role_id = ${answer.role_id}
    WHERE id = ${selectedEmployee[0].id};`);
    
    console.log(`Succesfully updated ${selectedEmployee[0].firstName}'s role`);
}
main();