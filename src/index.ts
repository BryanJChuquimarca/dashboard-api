import express from "express";
import cors from "cors";

const app = express();
const bcrypt = require("bcrypt");
app.use(cors());

import bodyParser from "body-parser";
const jsonParser = bodyParser.json();

import * as db from "./db-connection";

app.post("/api/auth/register", jsonParser, async (req, res) => {
  console.log(`Petición recibida al endpoint POST /api/auth/register. 
        Body: ${JSON.stringify(req.body)}`);

  const user = {
    email: req.body.email,
    name: req.body.name,
    password_hash: await bcrypt.hash(req.body.password, 10),
    created_at: new Date().toISOString().split("T")[0],
  };

  try {
    let query = `INSERT INTO users (email, name, password_hash, created_at)
        VALUES ('${user.email}', '${user.name}', '${user.password_hash}', '${user.created_at}');`;

    let db_response = await db.query(query);

    console.log(db_response);

    if (db_response.rowCount == 1) {
      res.json(`El registro ha sido creado correctamente.`);
    } else {
      res.json(`El registro NO ha sido creado.`);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/user/", async (req, res) => {
  console.log(`Petición recibida al endpoint GET /user/.`);

  try {
    let query = `SELECT * FROM users`;
    let db_response = await db.query(query);

    if (db_response.rows.length > 0) {
      console.log(`Usuario encontrado: ${db_response.rows[0].id}`);
      res.json(db_response.rows[0]);
    } else {
      console.log(`Usuario no encontrado.`);
      res.json(`User not found`);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () =>
  console.log(`App listening on PORT ${port}.

    ENDPOINTS:
    
     - GET /user/:email
     - POST /user
     `)
);
