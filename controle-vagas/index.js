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



app.get('/vagas', (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM vagas');
        const rows = stmt.all();
        res.status(200).send(rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.put('/vagas/:estacionamento', (req, res) => {
    const estacionamento = req.params.estacionamento;
    const { vagasDisponiveis } = req.body;
    try {
        const stmt = db.prepare('UPDATE vagas SET vagasDisponiveis = ? WHERE estacionamento = ?');
        const info = stmt.run(vagasDisponiveis, estacionamento);
        res.status(200).send({ changes: info.changes });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.listen(3003, () => console.log('Controle de Vagas rodando na porta 3003'));
