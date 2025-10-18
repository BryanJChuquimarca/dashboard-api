"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = query;
var pg_1 = require("pg");
var pool = new pg_1.Pool({
    user: 'postgres',
    password: '0645',
    host: 'localhost',
    port: 5432, // default Postgres port
    database: 'dashboard_db'
});
function query(text, params) {
    return pool.query(text, params);
}
;
