import inquirer from "inquirer";
import express from 'express';
import { pool, connectToDb } from './connection.js';

await connectToDb();

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

function choices() {
    inquirer
        .prompt([
            {
                type: "list",
                message: "Welcome to your CMS Database. Please choose from the options below.",
                name: "option",
                choices: [
                    "View all departments",
                    "View all roles",
                    "View all employees",
                    "Add a department",
                    "Add a Role",
                    "Add an Employee",
                    "Update an Employee role",
                    "Quit"
                ],
            },
        ])
        .then((response) => {
            if (response.option === "View all departments") {
                viewDepartments();
            }
            if (response.option === "View all roles") {
                viewRoles();
            }
            if (response.option === "View all employees") {
                viewEmployees();
            }
            if (response.option === "Add a department") {
                addDepartment();
            }
            if (response.option === "Add a Role") {
                addRole();
            }
            if (response.option === "Add an Employee") {
                addEmployee();
            }
            if (response.option === "Update an Employee role") {
                updateEmployee();
            }
            if (response.option === "Quit") {
                console.log("Goodbye!");
                process.exit();
            }
        })
        .catch((error) => {
            console.error("An error occurred:", error);
        });
}

function viewDepartments() {
    pool.query('SELECT * FROM department', (err, res) => {
        if (err) {
            console.error('Error executing query', err.stack);
        } else {
            console.table(res.rows);
            choices();
        }
    });
}

function viewRoles() {
    pool.query('SELECT * FROM role', (err, res) => {
        if (err) {
            console.error('Error executing query', err.stack);
        } else {
            console.table(res.rows);
            choices();
        }
    });
}

function viewEmployees() {
    pool.query('SELECT * FROM employee', (err, res) => {
        if (err) {
            console.error('Error executing query', err.stack);
        } else {
            console.table(res.rows);
            choices();
        }
    });
}

function addDepartment() {
    inquirer
        .prompt([
            {
                type: "input",
                message: "Enter the name of the Department you would like to add:",
                name: "department",
            },
        ])
        .then((response) => {
            pool.query('INSERT INTO department (name) VALUES ($1)', [response.department], (err, res) => {
                if (err) {
                    console.error('Error executing query', err.stack);
                } else {
                    console.log('Department added successfully.');
                    choices();
                }
            });
        });
}

function addRole() {
    pool.query('SELECT id, name FROM department', (err, res) => {
        if (err) {
            console.error('Error executing query', err.stack);
        } else {
            const departmentChoices = res.rows.map(department => ({
                name: department.name,
                value: department.id
            }));
    inquirer
        .prompt([
            {
                type: "input",
                message: "Enter the name of the Role you would like to add:",
                name: "role",
            },
            {
                type: "input",
                message: "Enter the Salary for this role:",
                name: "salary",
            },
            {
                type: "list",
                message: "Enter the Department this role belongs to:",
                name: "departmentId",
                choices: departmentChoices
            }
        ])
        .then((response) => {
            pool.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [response.role, response.salary, response.departmentId], (err, res) => {
                if (err) {
                    console.error('Error executing query', err.stack);
                } else {
                    console.log('Role added successfully.');
                    choices();
                }
                });
            });
        }
    });
}

function addEmployee() {
    inquirer
        .prompt([
            {
                type: "input",
                message: "Enter the employee's First name:",
                name: "firstName",
            },
            {
                type: "input",
                message: "Enter the employee's Last name:",
                name: "lastName",
            },
            {
                type: "input",
                message: "Enter the employee's Role:",
                name: "roleId",
            },
            {
                type: "list",
                message: "Enter the employee's Manager:",
                name: "managerId",
            },
        ])
        .then((response) => {
            pool.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [response.firstName, response.lastName, response.roleId, response.managerId], (err, res) => {
                if (err) {
                    console.error('Error executing query', err.stack);
                } else {
                    console.log('Employee added successfully.');
                    choices();
                }
            });
        });
}

function updateEmployee() {
    inquirer
        .prompt([
            {
                type: "input",
                message: "Enter the employee's First name whom you would like to update:",
                name: "employeeId",
            },
            {
                type: "input",
                message: "Enter the employee's Last name whom you would like to update:",
                name: "employeeId",
            },
            {
                type: "input",
                message: "Enter the new Role ID for this employee:",
                name: "roleId",
            },
        ])
        .then((response) => {
            pool.query('UPDATE employee SET role_id = $1 WHERE id = $2', [response.roleId, response.employeeId], (err, res) => {
                if (err) {
                    console.error('Error executing query', err.stack);
                } else {
                    console.log('Employee updated successfully.');
                    choices();
                }
            });
        });
}


choices();