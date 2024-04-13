import express, { Request, Response } from "express";
import mysql from "mysql2/promise";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();

// Database connection configuration
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT!,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// INNER JOIN
app.get("/inner_join", async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(`
      SELECT employees.name AS employee_name, departments.name AS department_name
      FROM employees
      INNER JOIN departments ON employees.department_id = departments.id
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// LEFT JOIN
app.get("/left_join", async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(`
      SELECT employees.name AS employee_name, departments.name AS department_name
      FROM employees
      LEFT JOIN departments ON employees.department_id = departments.id
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// LEFT JOIN with NULL_CHECK
app.get("/left_join_null_check", async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(`
      SELECT employees.name AS employee_name, departments.name AS department_name
      FROM employees
      LEFT JOIN departments ON employees.department_id = departments.id
      WHERE employees.department_id IS NULL OR departments.id IS NOT NULL
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// RIGHT JOIN
app.get("/right_join", async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(`
      SELECT employees.name AS employee_name, departments.name AS department_name
      FROM employees
      RIGHT JOIN departments ON employees.department_id = departments.id
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// RIGHT JOIN with NULL_CHECK
app.get("/right_join_null_check", async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(`
      SELECT employees.name AS employee_name, departments.name AS department_name
      FROM employees
      RIGHT JOIN departments ON employees.department_id = departments.id
      WHERE employees.department_id IS NOT NULL OR departments.id IS NULL
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// FULL JOIN
app.get("/full_join", async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(`
      SELECT employees.name AS employee_name, departments.name AS department_name
      FROM employees
      FULL JOIN departments ON employees.department_id = departments.id
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// FULL JOIN with NULL_CHECK
app.get("/full_join_null_check", async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(`
      SELECT employees.name AS employee_name, departments.name AS department_name
      FROM employees
      FULL JOIN departments ON employees.department_id = departments.id
      WHERE employees.department_id IS NOT NULL AND departments.id IS NOT NULL
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

const generateSampleData = async () => {
  try {
    // Create departments table
    await pool.query(`
      CREATE TABLE departments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100)
      )
    `);

    // Create employees table
    await pool.query(`
      CREATE TABLE employees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        department_id INT,
        FOREIGN KEY (department_id) REFERENCES departments(id)
      )
    `);

    // Insert departments
    await pool.query("INSERT INTO departments (name) VALUES ('HR'), ('Finance'), ('IT'), ('Marketing'), ('Operations'), ('Sales'), ('Research'), ('Legal')");

    // Insert employees with various department IDs
    const employeesData = [
      { name: "John Doe", department_id: 1 },
      { name: "Jane Smith", department_id: 1 },
      { name: "Mike Johnson", department_id: 2 },
      { name: "Emily Brown", department_id: 3 },
      { name: "Alex Wilson", department_id: 4 },
      { name: "Sarah Lee", department_id: 5 },
      { name: "David Jones", department_id: 6 },
      { name: "Emma Thompson", department_id: null },
    ];

    await pool.query("INSERT INTO employees (name, department_id) VALUES ?", [employeesData.map((emp) => [emp.name, emp.department_id])]);

    console.log("Sample data inserted successfully.");
  } catch (error) {
    console.error("Error inserting sample data:", error);
  }
};

// Endpoint to generate sample data
app.get("/generate_data", async (req, res) => {
  await generateSampleData();
  res.send("Sample data generation complete.");
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
