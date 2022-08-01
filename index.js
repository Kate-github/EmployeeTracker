const { welcomeMessage } = require('./constants');
const inquirer = require('inquirer');
const fs = require('fs');
const mysql = require('mysql2');
require('console.table');

const db = mysql.createConnection(
    {
        host: 'localhost',
        // MySQL username,
        user: 'root',
        // {TODO: Add your MySQL password}
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
    return inquirer.prompt(mainMenu).then(answers=>processMainMenu(answers));;
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

        default:
            return;
    }
}

function showDepts() {
    db.query('SELECT * FROM departments', function (err, results) {
        console.table(results);
        showMainMenu();
    });
}

function showRoles() {
    db.query('SELECT * FROM roles', function (err, results) {
        console.table(results);
        showMainMenu();
    });
}

function showEmps() {
    db.query('SELECT * FROM employees', function (err, results) {
        console.table(results);
        showMainMenu();
    });
}

main();