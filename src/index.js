import inquirer from "inquirer";
import express from 'express';
import { QueryResult } from 'pg';
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
                    "Update an Employee role"
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
        })
        .catch((error) => {
            console.error("An error occurred:", error);
        });
}

function viewDepartments() {
    console.log("Viewing all departments");
}

choices();