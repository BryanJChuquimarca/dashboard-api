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
import { GoogleGenerativeAI } from "@google/generative-ai";

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

interface JwtPayload {
  id: number;
  email: string;
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader)
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;

    req.user = {
      id: payload.id,
      email: payload.email,
    };

    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

//añadir usuario
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

//obtener token si el usuario exite
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
      db_response.rows[0].password_hash,
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
      { expiresIn: "1h" },
    );

    res.json({ token, message: "Login successful" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

//añadir item
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
      [title, description, status, userId, created_at],
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

//obtener items
app.get("/api/dashboard/", authMiddleware, async (req, res) => {
  console.log(`Petición recibida al endpoint GET /api/dashboard/.`);

  try {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const db_response = await db.query(
      `SELECT * FROM dashboard_data WHERE user_id=$1 ORDER BY created_at DESC;`,
      [userId],
    );

    res.status(200).json(db_response.rows);
  } catch (err) {
    console.error("Error fetching dashboard items:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//actualizar item
app.patch(
  "/api/dashboard/:id",
  authMiddleware,
  jsonParser,
  async (req, res) => {
    console.log(`Petición recibida al endpoint PATCH /api/dashboard/:id. 
        Body: ${JSON.stringify(req.body)}`);

    try {
      const userId = (req as AuthRequest).user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const itemId = parseInt(req.params.id, 10);
      if (isNaN(itemId)) {
        return res.status(400).json({ message: "Invalid item ID" });
      }

      const { title, description, status } = req.body;

      if (!title && !description && !status) {
        return res
          .status(400)
          .json({ message: "At least one field is required" });
      }

      const query = `UPDATE dashboard_data 
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          status = COALESCE($3, status)
      WHERE id=$4 AND user_id=$5
      RETURNING *;`;

      const db_response = await db.query(query, [
        title || null,
        description || null,
        status || null,
        itemId,
        userId,
      ]);

      if (db_response.rowCount === 0) {
        return res
          .status(404)
          .json({ message: "Item not found or not owned by user" });
      }

      return res.status(200).json(db_response.rows[0]);
    } catch (err) {
      console.error("Error updating dashboard item:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
);

//delete
app.delete("/api/dashboard/:id", authMiddleware, async (req, res) => {
  console.log(`Peticion recibida al endpoint DELETE /api/dashboard/.`);
  try {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const itemId = parseInt(req.params.id, 10);
    if (isNaN(itemId)) {
      return res.status(400).json({ message: "Invalid item ID" });
    }
    const query = `DELETE FROM dashboard_data WHERE id=$1 AND user_id=$2`;
    const db_response = await db.query(query, [itemId, userId]);

    if (db_response.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Item not found or not owned by user" });
    }
    return res.status(200).json({ message: "Item deleted successfully" });
  } catch (err) {
    console.error("Error deleting dashboard items:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/api/dashboard/important", authMiddleware, async (req, res) => {
  try {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const db_response = await db.query(
      `SELECT * FROM dashboard_data WHERE user_id=$1 ORDER BY created_at DESC;`,
      [userId],
    );

    const items = db_response.rows;
    if (!items || items.length === 0) {
      return res.status(200).json([]);
    }

    const prompt = `
    Eres un asistente que ayuda a priorizar tareas. Analiza la siguiente lista de items y cada uno de sus campos
    (cada uno tiene id, título, descripción, estado y fecha de creación estos los tienes que tener en cuenta) y responde SOLO con
    un array JSON de los IDs de los 3 items más importantes para el usuario, considerando título, descripción, estado en el que se encuentra y fecha de creacion.
    No expliques nada, solo responde el array de IDs.\n\nItems: ${JSON.stringify(items)}`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    let importantIds = [];
    try {
      importantIds = JSON.parse(text);
    } catch (e) {
      const match = text.match(/\[.*?\]/);
      if (match) {
        try {
          importantIds = JSON.parse(match[0]);
        } catch (e2) {
          return res.status(500).json({
            message: "Error procesando respuesta de Gemini",
            raw: text,
          });
        }
      } else {
        return res
          .status(500)
          .json({ message: "Respuesta inesperada de Gemini", raw: text });
      }
    }
    const importantItems = items.filter((item: any) =>
      importantIds.includes(item.id),
    );
    res.status(200).json(importantItems);
  } catch (err) {
    console.error("Error en /api/dashboard/important:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/api/user/profile", authMiddleware, async (req, res) => {
  console.log(`Petición recibida al endpoint GET /api/dashboard/.`);

  try {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const db_response = await db.query(
      `SELECT id, name, email, created_at FROM users WHERE id=$1;`,
      [userId],
    );

    res.status(200).json(db_response.rows);
  } catch (err) {
    console.error("Error fetching dashboard items:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.patch("/api/user/profile", authMiddleware, jsonParser, async (req, res) => {
  try {
    const userId = (req as AuthRequest).user?.id;
    const { name } = req.body;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({ message: "Nombre inválido" });
    }
    const result = await db.query(
      `UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email, created_at`,
      [name.trim(), userId],
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json({
      message: "Nombre actualizado correctamente",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Error al actualizar nombre de usuario:", err);
    res.status(500).json({ message: "Error interno al actualizar nombre" });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () =>
  console.log(`App listening on PORT ${port}.

    ENDPOINTS:
    
     - POST /api/auth/register
     - POST /api/auth/login
     - POST /api/dashboard
     - GET /api/dashboard
     - GET /api/dashboard/important
     - GET /api/user/profile
     - PATCH /api/dashboard/:id
     - PATCH /api/user/profile
     - DELETE /api/dashboard/:id
     `),
);
