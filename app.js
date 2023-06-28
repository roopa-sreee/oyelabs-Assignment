const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "customer.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Runs at port 3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// add user api code

app.post("/add-customer", async (request, response) => {
  const { name, phoneNumber } = request.body;

  //check whether user already exists

  const getUserQuery = `
    SELECT * FROM person WHERE customer_name = ${name};`;

  const dbUser = await db.get(getUserQuery);

  if (dbUser === undefined) {
    //query to add user to the database

    const addPersonQuery = `
        INSERT INTO person
            (customer_name,phone_number)
        VALUES ('${name}', ${phoneNumber});`;
    const dbUser = await db.run(addPersonQuery);
    const customerId = dbUser.lastID;
    response.send({ customerId: customerId });
  } else {
    response.status(400);
    response.send("User already exists");
  }
});

// login with phone number code

app.post("login-with-phone-number", async (request, response) => {
  const { phoneNumber } = request.body;

  //query to check whether user exists

  const getUserQuery = `
    SELECT * FROM person WHERE phone_number = ${phoneNumber};`;
  const dbResponse = await db.get(getUserQuery);
  if (dbResponse === undefined) {
    response.status(400);
    response.send("Invalid User");
  } else {
    response.status(200);
    response.send("LoggedIn Successfully");
  }
});
