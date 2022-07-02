const express = require("express");
const { Pool, Client } = require("pg");

const PORT = 3000;
const app = express();

const pool = new Pool({
  user: "burcak",
  host: "localhost",
  database: "cyf_ecommerce",
  password: "",
  port: 5432,
});

app.get("/customers", function (req, res) {
  pool.query("select * from customers", (error, response) => {
    if (error) {
      console.log("Something is wrong" + error);
    }
    res.json(response.rows);
  });
});

app.get("/suppliers", function (req, res) {
  pool.query("select * from suppliers", (error, response) => {
    if (error) {
      console.log("Something is wrong" + error);
    }
    res.json(response.rows);
  });
});

app.get("/products", function (req, res) {
  pool.query("select * from products", (error, response) => {
    if (error) {
      console.log("Something is wrong" + error);
    }
    res.json(response.rows);
  });
});


app.listen(PORT, function () {
    console.log(
      "Server is listening on port 3000 and connected to DB. Ready to accept requests!"
    );
  });