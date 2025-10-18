import express from "express";
import { Request, Response, NextFunction } from "express";
import cors from "cors";
const jwt = require("jsonwebtoken");
const app = express();
const bcrypt = require("bcrypt");
app.use(cors());
require("dotenv").config();

import bodyParser from "body-parser";
const jsonParser = bodyParser.json();

import * as db from "./db-connection";
interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader)
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: payload.id,
      email: payload.email,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

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
        VALUES ($1, $2, $3, $4);`;

    let db_response = await db.query(query, [
      user.email,
      user.name,
      user.password_hash,
      user.created_at,
    ]);

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

app.post("/api/auth/login", jsonParser, async (req, res) => {
  console.log(`Petición recibida al endpoint POST /api/auth/login. 
        Body: ${JSON.stringify(req.body)}`);

  try {
    let query = `SELECT * FROM users WHERE email=$1`;
    let db_response = await db.query(query, [req.body.email]);
    console.log(db_response);

    if (db_response.rowCount === 0) {
      return res
        .status(401)
        .json({ message: "Usuario o contraseña incorrectos" });
    }

    let validPassword = await bcrypt.compare(
      req.body.password,
      db_response.rows[0].password_hash
    );

    if (!validPassword) {
      return res
        .status(401)
        .json({ message: "Usuario o contraseña incorrectos" });
    }

    const token = jwt.sign(
      {
        id: db_response.rows[0].id,
        email: db_response.rows[0].email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, message: "Login successful" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/api/dashboard", authMiddleware, jsonParser, async (req, res) => {
  console.log(`Petición recibida al endpoint POST /api/dashboard. 
        Body: ${JSON.stringify(req.body)}`);

  const { title, description, status } = req.body;
  const created_at = new Date().toISOString().split("T")[0];
  try {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let db_response = await db.query(
      `INSERT INTO dashboard_data (title, description, status, user_id, created_at)
        VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
      [title, description, status, userId, created_at]
    );

    console.log(db_response);

    if (db_response.rowCount === 1) {
      return res.status(201).json(db_response.rows[0]);
    } else {
      return res.status(400).json({ message: "Insert failed" });
    }
  } catch (err) {
    console.error("Error inserting dashboard item:", err);
    return res.status(500).send("Internal Server Error");
  }
});

app.get("/api/dashboard/", authMiddleware, async (req, res) => {
  console.log(`Petición recibida al endpoint GET /api/dashboard/.`);

  try {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const db_response = await db.query(
      `SELECT * FROM dashboard_data WHERE user_id=$1 ORDER BY created_at DESC;`,
      [userId]
    );

    res.status(200).json(db_response.rows);
  } catch (err) {
    console.error("Error fetching dashboard items:", err);
    res.status(500).json({ message: "Internal Server Error" });
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
