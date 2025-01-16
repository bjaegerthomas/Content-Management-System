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
            console.error('Error executing query', err);
        } else {
            console.log('ID   Department Name');
            console.log('----------------------');
            res.rows.forEach((department) => {
                console.log(`${department.id.toString().padEnd(4)} ${department.name.padEnd(20)}`);
            });
            choices();
        }
    });
}

function viewRoles() {
    const query = `
        SELECT role.id, role.title, role.salary, department.name AS department
        FROM role
        JOIN department ON role.department_id = department.id
    `;
    pool.query(query, (err, res) => {
        if (err) {
            console.error('Error executing query', err);
        } else {
            console.log('ID   Title                  Salary     Department');
            console.log('-----------------------------------------------');
            res.rows.forEach((role) => {
                console.log(
                    `${role.id.toString().padEnd(4)} ${role.title.padEnd(22)} ${role.salary.toString().padEnd(10)} ${role.department.padEnd(15)}`
                );
            });
            choices();
        }
    });
}

function viewEmployees() {
    const query = `
        SELECT e1.id, 
               CONCAT(e1.first_name, ' ', e1.last_name) AS name, 
               role.title AS job_title, 
               role.salary,
               CONCAT(e2.first_name, ' ', e2.last_name) AS manager_name,
               CONCAT(e3.first_name, ' ', e3.last_name) AS managed_employee_name
        FROM employee e1
        JOIN role ON e1.role_id = role.id
        LEFT JOIN employee e2 ON e1.manager_id = e2.id
        LEFT JOIN employee e3 ON e1.id = e3.manager_id
        ORDER BY e1.id ASC
    `;
    pool.query(query, (err, res) => {
        if (err) {
            console.error('Error executing query', err);
        } else {
            console.log('ID   Name                 Job Title            Salary     Manager');
            console.log('-----------------------------------------------------------------');
            res.rows.forEach((employee) => {
                console.log(
                    `${employee.id.toString().padEnd(4)} ${employee.name.padEnd(20)} ${employee.job_title.padEnd(20)} ${employee.salary.toString().padEnd(10)} ${employee.managed_employee_name ? employee.managed_employee_name.padEnd(20) : 'None'.padEnd(20)}`
                );
            });
            choices();
        }
    });
}

function addDepartment() {
    inquirer
        .prompt([
            {
                type: "input",
                message: "Enter the Department name you would like to create:",
                name: "name"
            },
        ])
        .then((response) => {
            pool.query('SELECT COUNT(*) FROM department', (err, res) => {
                if (err) {
                    console.error('Error executing query', err);
                } else {
                    let newDepartmentId = parseInt(res.rows[0].count) + 1;
                    pool.query('INSERT INTO department (id, name) VALUES ($1, $2)', [newDepartmentId, response.name], (err, res) => {
                        if (err) {
                            console.error('Error executing query', err);
                        } else {
                            console.log('Department added successfully.');
                            choices();
                        }
                    });
                }
            });
        });
    }

function addRole() {
    pool.query('SELECT name FROM department', (err, res) => {
        if (err) {
            console.error('Error executing query', err);
        } else {
            const departmentChoices = res.rows.map(department => department.name);
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
                    pool.query('SELECT COUNT(*) FROM role', (err, res) => {
                        if (err) {
                            console.error('Error executing query', err);
                        } else {
                            let newRoleId = parseInt(res.rows[0].count) + 1;
                            pool.query('SELECT id FROM department WHERE name = $1', [response.departmentId], (err, res) => {
                                if (err) {
                                    console.error('Error executing query', err);
                                } else {
                                    const relatedDepartmentId = res.rows[0].id;
                                    pool.query('INSERT INTO role (id, title, salary, department_id) VALUES ($1, $2, $3, $4)', [newRoleId, response.role, response.salary, relatedDepartmentId], (err) => {
                                        if (err) {
                                            console.error('Error executing query', err);
                                        } else {
                                            console.log('Role added successfully.');
                                            choices();
                                        }
                                    });
                                }
                            });
                        }
                    });
                });
        }
    });
}

function addEmployee() {
    pool.query('SELECT title FROM role', (err, res) => {
        if (err) {
            console.error('Error executing query', err);
        } else {
            const roleChoices = res.rows.map(role => role.title);
            pool.query('SELECT first_name, last_name FROM employee WHERE manager_id IS NOT NULL', (err, res) => {
                if (err) {
                    console.error('Error executing query', err);
                } else {
                    const managerChoices = res.rows.map(employee => `${employee.first_name} ${employee.last_name}`);
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
                                type: "list",
                                message: "Enter the employee's Role:",
                                choices: roleChoices,
                                name: "roleId",
                            },
                        ])
                        .then((response) => {
                            pool.query('SELECT COUNT(*) FROM employee', (err, res) => {
                                if (err) {
                                    console.error('Error executing query', err);
                                } else {
                                    let newEmployeeId = parseInt(res.rows[0].count) + 1;
                                    pool.query('SELECT id FROM role WHERE title = $1', [response.roleId], (err, res) => {
                                        if (err) {
                                            console.error('Error executing query', err);
                                        } else {
                                            const relatedRoleId = res.rows[0].id;
                                            pool.query('SELECT department_id FROM role WHERE id = $1', [relatedRoleId], (err, res) => {
                                                if (err) {
                                                    console.error('Error executing query', err);
                                                } else {
                                                    const departmentId = res.rows[0].department_id;
                                                    pool.query('SELECT id FROM employee WHERE role_id IN (SELECT id FROM role WHERE department_id = $1) AND manager_id IS NOT NULL LIMIT 1', [departmentId], (err, res) => {
                                                        if (err) {
                                                            console.error('Error executing query', err);
                                                        } else {
                                                            const relatedManagerId = res.rows.length > 0 ? res.rows[0].id : null;
                                                            pool.query('INSERT INTO employee (id, first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4, $5)', [newEmployeeId, response.firstName, response.lastName, relatedRoleId, relatedManagerId], (err, res) => {
                                                                if (err) {
                                                                    console.error('Error executing query', err);
                                                                } else {
                                                                    console.log('Employee added successfully.');
                                                                    choices();
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        });
                }
            });
        }
    });
}

function updateEmployee() {
    pool.query('SELECT first_name, last_name FROM employee', (err, res) => {
        if (err) {
            console.error('Error executing query', err);
        } else {
            const employeeChoices = res.rows.map(employee => `${employee.first_name} ${employee.last_name}`);
            pool.query('SELECT title FROM role', (err, res) => {
                if (err) {
                    console.error('Error executing query', err);
                } else {
                    const roleChoices = res.rows.map(role => role.title);
                    inquirer
                        .prompt([
                            {
                                type: "list",
                                message: "Select the employee's Name you would like to update:",
                                name: "employeeName",
                                choices: employeeChoices,
                            },
                            {
                                type: "list",
                                message: "Select the new Role for this employee:",
                                name: "roleId",
                                choices: roleChoices,
                            }
                        ])
                        .then((response) => {
                            const [firstName, lastName] = response.employeeName.split(' ');
                            pool.query('SELECT id FROM role WHERE title = $1', [response.roleId], (err, res) => {
                                if (err) {
                                    console.error('Error executing query', err);
                                } else {
                                    const relatedRoleId = res.rows[0].id;
                                    pool.query('UPDATE employee SET role_id = $1 WHERE first_name = $2 AND last_name = $3', [relatedRoleId, firstName, lastName], (err, res) => {
                                        if (err) {
                                            console.error('Error executing query', err);
                                        } else {
                                            console.log('Employee updated successfully.');
                                            choices();
                                        }
                                    });
                                }
                            });
                        });
                }
            });
        }
    });
}

choices();