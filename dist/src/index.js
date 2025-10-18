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
        return res.status(401).json({ message: "Invalid token" });
    }
};
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
var port = process.env.PORT || 3000;
app.listen(port, function () {
    return console.log("App listening on PORT ".concat(port, ".\n\n    ENDPOINTS:\n    \n     - GET /user/:email\n     - POST /user\n     "));
});
