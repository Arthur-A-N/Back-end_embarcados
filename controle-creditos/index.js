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



app.post('/creditos', (req, res) => {
    const { cpf, valor } = req.body;
    try {
        const stmt = db.prepare('INSERT INTO creditos (cpf, valor) VALUES (?, ?)');
        const info = stmt.run(cpf, valor);
        res.status(201).send({ id: info.lastInsertRowid });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/creditos/:cpf', (req, res) => {
    const cpf = req.params.cpf;
    try {
        const stmt = db.prepare('SELECT SUM(valor) as totalCreditos FROM creditos WHERE cpf = ?');
        const row = stmt.get(cpf);
        res.status(200).send(row);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.listen(3002, () => console.log('Controle de Créditos rodando na porta 3002'));
