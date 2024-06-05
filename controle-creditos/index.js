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

    // Validação dos dados de entrada
    if (!cpf || typeof cpf !== 'string' || !valor || typeof valor !== 'number') {
        return res.status(400).send({ error: 'Dados inválidos. Certifique-se de que "cpf" é uma string e "valor" é um número.' });
    }

    try {
        const stmt = db.prepare('INSERT INTO creditos (cpf, valor) VALUES (?, ?)');
        const info = stmt.run(cpf, valor);
        res.status(201).send({ id: info.lastInsertRowid });
    } catch (err) {
        console.error(err.message);
        res.status(500).send({ error: 'Erro ao inserir crédito. Verifique os dados e tente novamente.' });
    }
});

app.get('/creditos/:cpf', (req, res) => {
    const cpf = req.params.cpf;

    // Validação dos dados de entrada
    if (!cpf || typeof cpf !== 'string') {
        return res.status(400).send({ error: 'CPF inválido. Certifique-se de que "cpf" é uma string válida.' });
    }

    try {
        const stmt = db.prepare('SELECT SUM(valor) as totalCreditos FROM creditos WHERE cpf = ?');
        const row = stmt.get(cpf);
        res.status(200).send(row);
    } catch (err) {
        console.error(err.message);
        res.status(500).send({ error: 'Erro ao buscar créditos. Tente novamente mais tarde.' });
    }
});

app.listen(3002, () => console.log('Controle de Créditos rodando na porta 3002'));
