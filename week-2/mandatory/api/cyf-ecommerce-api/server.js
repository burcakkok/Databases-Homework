const express = require("express");
const { Pool, Client } = require("pg");
const bodyParser = require("body-parser");
const { request } = require("express");

const PORT = 3001;
const app = express();

app.use(bodyParser.json());

const pool = new Pool({
  user: "burcak",
  host: "localhost",
  database: "postgres",
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

// app.get('/customers', (req, res) => {
//   pool.query('select * from customers')
//       .then(response => res.json(response.rows))
//       .catch(error => console.log("Something went wrong " + error));
// });

// app.get("/suppliers", function (req, res) {
//   pool.query('select supplier_name as name,country from suppliers', (error, response) => {
//     if (error) {
//       console.log("Something is wrong" + error);
//     }
//     res.json(response.rows);
//   });
// });

// app.get("/products", function (req, res) {
//   pool.query('select p.product_name, p.unit_price, s.supplier_name from products p join suppliers s on s.id = p.supplier_id', (error, response) => {
//     if (error) {
//       console.log("Something is wrong" + error);
//     }
//     res.json(response.rows);
//   });
// });

// DATABASE WEEK3 HOMEWORK
// - If you don't have it already,
// add a new GET endpoint `/products` to load all the product names along with their supplier names.
app.get("/products", async (req, res) => {
  try {
    const selectProducts = await pool.query(
      "select products.product_name,suppliers.supplier_name from products INNER join suppliers on products.supplier_id=suppliers.id"
    );
    res.json(selectProducts.rows);
  } catch (err) {
    console.error(err.message);
  }
});

// Update the previous GET endpoint `/products` to filter the list of products by name using a query parameter,
// for example `/products?name=Cup`. This endpoint should still work even if you don't use the `name` query parameter!

app.get("/products", (req, res) => {
  const newproduct = req.query.productname;

  const allProducts =
    "select products.product_name,suppliers.supplier_name " +
    "from products " +
    "INNER join suppliers on products.supplier_id=suppliers.id";

  const productByName =
    "select products.product_name,suppliers.supplier_name " +
    "from products " +
    "INNER join suppliers on products.supplier_id=suppliers.id " +
    "where products.product_name like $1";

  if (newproduct) {
    // We have a name
    pool
      .query(productByName, [newproduct])
      .then((result) => res.json(result.rows));
  } else {
    // No name at all
    pool.query(allProducts).then((result) => {
      res.json(result.rows);
    });
  }
});

// - Add a new GET endpoint `/customers/:customerId` to load a single customer by ID.

app.get("/customers/:customerId", (req, res) => {
  const customerId = req.params.customerId;

  const customersById = "select * from customers where id = $1";

  pool
    .query(customersById, [customerId])
    .then((result) => {
      if (result.rows.length > 0) {
        res.json(result.rows);
      } else {
        res.status(400).send(`ID does not exist`);
      }
    })
    .catch((error) => console.log("Something is wrong " + error));
});

// - Add a new POST endpoint `/customers` to create a new customer.

app.post("/customers", (req, res) => {
  // console.log(req.body);
  const name = req.body.name;
  const address = req.body.address;
  const city = req.body.city;
  const country = req.body.country;
  // console.log(name);
  const createCustomer =
    "Insert into customers (name, address, city, country) Values ($1, $2, $3, $4)";

  pool
    .query(createCustomer, [name, address, city, country])
    .then(() => res.send("Customer created!"))
    .catch((error) => res.send(error.message));
});

// - Add a new POST endpoint `/products` to create a new product (with a product name, a price and a supplier id).
// Check that the price is a positive integer and that the supplier ID exists in the database, otherwise return an error.

// - Add a new POST endpoint `/customers/:customerId/orders` to create a new order (including an order date, and an order reference) for a customer.
// Check that the customerId corresponds to an existing customer or return an error.

app.post("/customers/:customerId/orders", (req, res) => {
  let orderDate = req.body.order_date;
  let orderRef = req.body.order_reference;
  let customerId = req.params.customerId;

  const checkCustomer = "select * from customers where id = $1";
  const insertOrder =
    "Insert into orders(order_date, order_reference, customer_id) values ($1, $2, $3)";

  pool
    .query(checkCustomer, [customerId])
    .then((result) => {
      if (result.rows.length > 0) {
        pool
          .query(insertOrder, [orderDate, orderRef, customerId])
          .then(() => res.send("Order created!"))
          .catch((error) =>
            console.error("Something went wrong adding the new order" + error)
          );
      } else {
        res.status(400).send(" Customer ID" + customerId + "does not exist");
      }
    })
    .catch((error) => console.error("Something is wrong" + error));
});

// - Add a new PUT endpoint `/customers/:customerId` to update an existing customer (name, address, city and country).

// - Add a new DELETE endpoint `/orders/:orderId` to delete an existing order along all the associated order items.

// - Add a new DELETE endpoint `/customers/:customerId` to delete an existing customer only if this customer doesn't have orders.

// - Add a new GET endpoint `/customers/:customerId/orders` to load all the orders along the items in the orders of a specific customer.
// Especially, the following information should be returned: order references, order dates, product names, unit prices, suppliers and quantities.

app.get("/customers/:customerId/orders", (req, res) => {


  const getCustomerOrders = "select o.order_reference, o.order_date, p.product_name, p.unit_price, s.supplier_name" + 
  "from orders o join order_items oi on o.id = oi.order_id" + 
  "join products p on p.id = oi.product_id" + 
  "join suppliers s on p.supplier_id = s.id" + 
  "where o.customer_id = $1"


  pool.query(getCustomerOrders, [customerId])
      .then(result => res.json(result.rows))
      .catch((error) => console.error("Something is wrong" + error));

});

app.listen(PORT, function () {
  console.log(
    "Server is listening on port 3001 and connected to DB. Ready to accept requests!"
  );
});
