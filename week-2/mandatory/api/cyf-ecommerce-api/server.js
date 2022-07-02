const express = require("express");
const { Pool, Client } = require("pg");

const PORT = 3001;
const app = express();

const pool = new Pool({
  user: "burcak",
  host: "localhost",
  database: "postgres",
  password: "",
  port: 5432,
});

app.get("/customers", function (req, res) {
  pool.query('select * from customers', (error, response) => {
    if (error) {
      console.log("Something is wrong" + error);
    }
    res.json(response.rows);
  });
});

app.get('/customers', (req, res) => {
  pool.query('select * from customers')
      .then(response => res.json(response.rows))
      .catch(error => console.log("Something went wrong " + error));
});


app.get("/suppliers", function (req, res) {
  pool.query('select supplier_name as name,country from suppliers', (error, response) => {
    if (error) {
      console.log("Something is wrong" + error);
    }
    res.json(response.rows);
  });
});

app.get("/products", function (req, res) {
  pool.query('select p.product_name, p.unit_price, s.supplier_name from products p join suppliers s on s.id = p.supplier_id', (error, response) => {
    if (error) {
      console.log("Something is wrong" + error);
    }
    res.json(response.rows);
  });
});

app.listen(PORT, function () {
  console.log(
    "Server is listening on port 3001 and connected to DB. Ready to accept requests!"
  );
});
