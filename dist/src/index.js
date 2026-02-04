"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
var jwt = require("jsonwebtoken");
var app = (0, express_1.default)();
var bcrypt = require("bcrypt");
app.use((0, cors_1.default)());
require("dotenv").config();
var body_parser_1 = __importDefault(require("body-parser"));
var jsonParser = body_parser_1.default.json();
var db = __importStar(require("./db-connection"));
var generative_ai_1 = require("@google/generative-ai");
var genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
var authMiddleware = function (req, res, next) {
    var authHeader = req.headers["authorization"];
    if (!authHeader)
        return res.status(401).json({ message: "No token provided" });
    var token = authHeader.split(" ")[1];
    try {
        var payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            id: payload.id,
            email: payload.email,
        };
        next();
    }
    catch (err) {
        return res.status(403).json({ message: "Invalid token" });
    }
};
//añadir usuario
app.post("/api/auth/register", jsonParser, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var user, query, db_response, err_1;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                console.log("Petici\u00F3n recibida al endpoint POST /api/auth/register. \n        Body: ".concat(JSON.stringify(req.body)));
                _a = {
                    email: req.body.email,
                    name: req.body.name
                };
                return [4 /*yield*/, bcrypt.hash(req.body.password, 10)];
            case 1:
                user = (_a.password_hash = _b.sent(),
                    _a.created_at = new Date().toISOString().split("T")[0],
                    _a);
                _b.label = 2;
            case 2:
                _b.trys.push([2, 4, , 5]);
                query = "INSERT INTO users (email, name, password_hash, created_at)\n        VALUES ($1, $2, $3, $4);";
                return [4 /*yield*/, db.query(query, [
                        user.email,
                        user.name,
                        user.password_hash,
                        user.created_at,
                    ])];
            case 3:
                db_response = _b.sent();
                console.log(db_response);
                if (db_response.rowCount == 1) {
                    res.json("El registro ha sido creado correctamente.");
                }
                else {
                    res.json("El registro NO ha sido creado.");
                }
                return [3 /*break*/, 5];
            case 4:
                err_1 = _b.sent();
                console.error(err_1);
                res.status(500).send("Internal Server Error");
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
//obtener token si el usuario exite
app.post("/api/auth/login", jsonParser, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query, db_response, validPassword, token, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("Petici\u00F3n recibida al endpoint POST /api/auth/login. \n        Body: ".concat(JSON.stringify(req.body)));
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                query = "SELECT * FROM users WHERE email=$1";
                return [4 /*yield*/, db.query(query, [req.body.email])];
            case 2:
                db_response = _a.sent();
                console.log(db_response);
                if (db_response.rowCount === 0) {
                    return [2 /*return*/, res
                            .status(401)
                            .json({ message: "Usuario o contraseña incorrectos" })];
                }
                return [4 /*yield*/, bcrypt.compare(req.body.password, db_response.rows[0].password_hash)];
            case 3:
                validPassword = _a.sent();
                if (!validPassword) {
                    return [2 /*return*/, res
                            .status(401)
                            .json({ message: "Usuario o contraseña incorrectos" })];
                }
                token = jwt.sign({
                    id: db_response.rows[0].id,
                    email: db_response.rows[0].email,
                }, process.env.JWT_SECRET, { expiresIn: "1h" });
                res.json({ token: token, message: "Login successful" });
                return [3 /*break*/, 5];
            case 4:
                err_2 = _a.sent();
                console.error(err_2);
                res.status(500).send("Internal Server Error");
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
//añadir item
app.post("/api/dashboard", authMiddleware, jsonParser, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, title, description, status, created_at, userId, db_response, err_3;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                console.log("Petici\u00F3n recibida al endpoint POST /api/dashboard. \n        Body: ".concat(JSON.stringify(req.body)));
                _a = req.body, title = _a.title, description = _a.description, status = _a.status;
                created_at = new Date().toISOString().split("T")[0];
                _c.label = 1;
            case 1:
                _c.trys.push([1, 3, , 4]);
                userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                if (!userId) {
                    return [2 /*return*/, res.status(401).json({ message: "Unauthorized" })];
                }
                return [4 /*yield*/, db.query("INSERT INTO dashboard_data (title, description, status, user_id, created_at)\n        VALUES ($1, $2, $3, $4, $5) RETURNING *;", [title, description, status, userId, created_at])];
            case 2:
                db_response = _c.sent();
                console.log(db_response);
                if (db_response.rowCount === 1) {
                    return [2 /*return*/, res.status(201).json(db_response.rows[0])];
                }
                else {
                    return [2 /*return*/, res.status(400).json({ message: "Insert failed" })];
                }
                return [3 /*break*/, 4];
            case 3:
                err_3 = _c.sent();
                console.error("Error inserting dashboard item:", err_3);
                return [2 /*return*/, res.status(500).send("Internal Server Error")];
            case 4: return [2 /*return*/];
        }
    });
}); });
//obtener items
app.get("/api/dashboard/", authMiddleware, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, db_response, err_4;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                console.log("Petici\u00F3n recibida al endpoint GET /api/dashboard/.");
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return [2 /*return*/, res.status(401).json({ message: "Unauthorized" })];
                }
                return [4 /*yield*/, db.query("SELECT * FROM dashboard_data WHERE user_id=$1 ORDER BY created_at DESC;", [userId])];
            case 2:
                db_response = _b.sent();
                res.status(200).json(db_response.rows);
                return [3 /*break*/, 4];
            case 3:
                err_4 = _b.sent();
                console.error("Error fetching dashboard items:", err_4);
                res.status(500).json({ message: "Internal Server Error" });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
//actualizar item
app.patch("/api/dashboard/:id", authMiddleware, jsonParser, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, itemId, _a, title, description, status_1, query, db_response, err_5;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                console.log("Petici\u00F3n recibida al endpoint PATCH /api/dashboard/:id. \n        Body: ".concat(JSON.stringify(req.body)));
                _c.label = 1;
            case 1:
                _c.trys.push([1, 3, , 4]);
                userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                if (!userId) {
                    return [2 /*return*/, res.status(401).json({ message: "Unauthorized" })];
                }
                itemId = parseInt(req.params.id, 10);
                if (isNaN(itemId)) {
                    return [2 /*return*/, res.status(400).json({ message: "Invalid item ID" })];
                }
                _a = req.body, title = _a.title, description = _a.description, status_1 = _a.status;
                if (!title && !description && !status_1) {
                    return [2 /*return*/, res
                            .status(400)
                            .json({ message: "At least one field is required" })];
                }
                query = "UPDATE dashboard_data \n      SET title = COALESCE($1, title),\n          description = COALESCE($2, description),\n          status = COALESCE($3, status)\n      WHERE id=$4 AND user_id=$5\n      RETURNING *;";
                return [4 /*yield*/, db.query(query, [
                        title || null,
                        description || null,
                        status_1 || null,
                        itemId,
                        userId,
                    ])];
            case 2:
                db_response = _c.sent();
                if (db_response.rowCount === 0) {
                    return [2 /*return*/, res
                            .status(404)
                            .json({ message: "Item not found or not owned by user" })];
                }
                return [2 /*return*/, res.status(200).json(db_response.rows[0])];
            case 3:
                err_5 = _c.sent();
                console.error("Error updating dashboard item:", err_5);
                return [2 /*return*/, res.status(500).json({ message: "Internal Server Error" })];
            case 4: return [2 /*return*/];
        }
    });
}); });
//delete
app.delete("/api/dashboard/:id", authMiddleware, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, itemId, query, db_response, err_6;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                console.log("Peticion recibida al endpoint DELETE /api/dashboard/.");
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return [2 /*return*/, res.status(401).json({ message: "Unauthorized" })];
                }
                itemId = parseInt(req.params.id, 10);
                if (isNaN(itemId)) {
                    return [2 /*return*/, res.status(400).json({ message: "Invalid item ID" })];
                }
                query = "DELETE FROM dashboard_data WHERE id=$1 AND user_id=$2";
                return [4 /*yield*/, db.query(query, [itemId, userId])];
            case 2:
                db_response = _b.sent();
                if (db_response.rowCount === 0) {
                    return [2 /*return*/, res
                            .status(404)
                            .json({ message: "Item not found or not owned by user" })];
                }
                return [2 /*return*/, res.status(200).json({ message: "Item deleted successfully" })];
            case 3:
                err_6 = _b.sent();
                console.error("Error deleting dashboard items:", err_6);
                return [2 /*return*/, res.status(500).json({ message: "Internal Server Error" })];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.get("/api/dashboard/important", authMiddleware, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, db_response, items, prompt_1, model, result, text, importantIds_1, match, importantItems, err_7;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return [2 /*return*/, res.status(401).json({ message: "Unauthorized" })];
                }
                return [4 /*yield*/, db.query("SELECT * FROM dashboard_data WHERE user_id=$1 ORDER BY created_at DESC;", [userId])];
            case 1:
                db_response = _b.sent();
                items = db_response.rows;
                if (!items || items.length === 0) {
                    return [2 /*return*/, res.status(200).json([])];
                }
                prompt_1 = "\n    Eres un asistente que ayuda a priorizar tareas. Analiza la siguiente lista de items y cada uno de sus campos\n    (cada uno tiene id, t\u00EDtulo, descripci\u00F3n, estado y fecha de creaci\u00F3n estos los tienes que tener en cuenta) y responde SOLO con\n    un array JSON de los IDs de los 3 items m\u00E1s importantes para el usuario, considerando t\u00EDtulo, descripci\u00F3n, estado en el que se encuentra y fecha de creacion.\n    No expliques nada, solo responde el array de IDs.\n\nItems: ".concat(JSON.stringify(items));
                model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
                return [4 /*yield*/, model.generateContent(prompt_1)];
            case 2:
                result = _b.sent();
                text = result.response.text();
                importantIds_1 = [];
                try {
                    importantIds_1 = JSON.parse(text);
                }
                catch (e) {
                    match = text.match(/\[.*?\]/);
                    if (match) {
                        try {
                            importantIds_1 = JSON.parse(match[0]);
                        }
                        catch (e2) {
                            return [2 /*return*/, res.status(500).json({
                                    message: "Error procesando respuesta de Gemini",
                                    raw: text,
                                })];
                        }
                    }
                    else {
                        return [2 /*return*/, res
                                .status(500)
                                .json({ message: "Respuesta inesperada de Gemini", raw: text })];
                    }
                }
                importantItems = items.filter(function (item) {
                    return importantIds_1.includes(item.id);
                });
                res.status(200).json(importantItems);
                return [3 /*break*/, 4];
            case 3:
                err_7 = _b.sent();
                console.error("Error en /api/dashboard/important:", err_7);
                res.status(500).json({ message: "Internal Server Error" });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.get("/api/user/profile", authMiddleware, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, db_response, err_8;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                console.log("Petici\u00F3n recibida al endpoint GET /api/dashboard/.");
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return [2 /*return*/, res.status(401).json({ message: "Unauthorized" })];
                }
                return [4 /*yield*/, db.query("SELECT id, name, email, created_at FROM users WHERE id=$1;", [userId])];
            case 2:
                db_response = _b.sent();
                res.status(200).json(db_response.rows);
                return [3 /*break*/, 4];
            case 3:
                err_8 = _b.sent();
                console.error("Error fetching dashboard items:", err_8);
                res.status(500).json({ message: "Internal Server Error" });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.patch("/api/user/profile", authMiddleware, jsonParser, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, name_1, result, err_9;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                name_1 = req.body.name;
                if (!userId) {
                    return [2 /*return*/, res.status(401).json({ message: "Unauthorized" })];
                }
                if (!name_1 || typeof name_1 !== "string" || name_1.trim() === "") {
                    return [2 /*return*/, res.status(400).json({ message: "Nombre inválido" })];
                }
                return [4 /*yield*/, db.query("UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email, created_at", [name_1.trim(), userId])];
            case 1:
                result = _b.sent();
                if (result.rowCount === 0) {
                    return [2 /*return*/, res.status(404).json({ message: "Usuario no encontrado" })];
                }
                res.json({
                    message: "Nombre actualizado correctamente",
                    user: result.rows[0],
                });
                return [3 /*break*/, 3];
            case 2:
                err_9 = _b.sent();
                console.error("Error al actualizar nombre de usuario:", err_9);
                res.status(500).json({ message: "Error interno al actualizar nombre" });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
var port = process.env.PORT || 3000;
app.listen(port, function () {
    return console.log("App listening on PORT ".concat(port, ".\n\n    ENDPOINTS:\n    \n     - POST /api/auth/register\n     - POST /api/auth/login\n     - POST /api/dashboard\n     - GET /api/dashboard\n     - GET /api/dashboard/important\n     - GET /api/user/profile\n     - PATCH /api/dashboard/:id\n     - PATCH /api/user/profile\n     - DELETE /api/dashboard/:id\n     "));
});
