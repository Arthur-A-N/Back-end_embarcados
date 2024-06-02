const express = require('express');
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbDir = path.resolve(__dirname, '../database');
const dbPath = path.resolve(dbDir, 'parking.db');

// Certifique-se de que o diretório do banco de dados existe
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

const app = express();
app.use(express.json());

// Rota GET para obter todos os usuários
app.get('/usuarios', (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM usuarios');
        const usuarios = stmt.all();
        res.status(200).json(usuarios);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Rota POST para criar um novo usuário
app.post('/usuarios', (req, res) => {
    const { cpf, nome, categoria } = req.body;
    try {
        const stmt = db.prepare('INSERT INTO usuarios (cpf, nome, categoria) VALUES (?, ?, ?)');
        const info = stmt.run(cpf, nome, categoria);
        res.status(201).send({ id: info.lastInsertRowid });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.listen(3001, () => console.log('Servidor rodando na porta 3001'));
