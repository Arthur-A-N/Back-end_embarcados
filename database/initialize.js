const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'parking.db');

// Certifique-se de que o diretório do banco de dados existe
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

db.exec(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cpf TEXT NOT NULL UNIQUE,
    nome TEXT NOT NULL,
    categoria TEXT NOT NULL
)`);

db.exec(`CREATE TABLE IF NOT EXISTS creditos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cpf TEXT NOT NULL,
    valor REAL NOT NULL,
    FOREIGN KEY (cpf) REFERENCES usuarios (cpf)
)`);

db.exec(`CREATE TABLE IF NOT EXISTS vagas (
    estacionamento TEXT PRIMARY KEY,
    vagasDisponiveis INTEGER NOT NULL
)`);

db.exec(`CREATE TABLE IF NOT EXISTS acessos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cpf TEXT NOT NULL,
    estacionamento TEXT NOT NULL,
    tipo TEXT NOT NULL,
    data TEXT NOT NULL,
    FOREIGN KEY (cpf) REFERENCES usuarios (cpf)
)`);

console.log('Banco de dados inicializado');
db.close();
