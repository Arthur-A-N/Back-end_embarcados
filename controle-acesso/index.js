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

app.post('/acesso/entrada', (req, res) => {
    const { cpf, estacionamento } = req.body;
    db.transaction(() => {
        const vagasStmt = db.prepare('SELECT vagasDisponiveis FROM vagas WHERE estacionamento = ?');
        const vaga = vagasStmt.get(estacionamento);
        if (vaga.vagasDisponiveis > 0) {
            const updateVagasStmt = db.prepare('UPDATE vagas SET vagasDisponiveis = vagasDisponiveis - 1 WHERE estacionamento = ?');
            updateVagasStmt.run(estacionamento);

            /*const entradaStmt = db.prepare('INSERT INTO acessos (cpf, estacionamento, tipo, data) VALUES (?, ?, "entrada", datetime("now"))');
            entradaStmt.run(cpf, estacionamento);*/
            const entradaStmt = db.prepare('INSERT INTO acessos (cpf, estacionamento, tipo, data) VALUES (?, ?, ?, datetime(\'now\'))');
            entradaStmt.run(cpf, estacionamento, 'entrada');
            res.status(200).send({ message: "Entrada permitida" });
        } else {
            res.status(403).send({ message: "Estacionamento lotado" });
        }
    })();
});

app.post('/acesso/saida', (req, res) => {
    const { cpf, estacionamento } = req.body;
    db.transaction(() => {
        const entradaStmt = db.prepare('INSERT INTO acessos (cpf, estacionamento, tipo, data) VALUES (?, ?, ?, datetime(\'now\'))');
            entradaStmt.run(cpf, estacionamento, 'saida');

        const updateVagasStmt = db.prepare('UPDATE vagas SET vagasDisponiveis = vagasDisponiveis + 1 WHERE estacionamento = ?');
        updateVagasStmt.run(estacionamento);

        const updateCreditosStmt = db.prepare('UPDATE creditos SET valor = valor - 1 WHERE cpf = ?');
        updateCreditosStmt.run(cpf);
        res.status(200).send({ message: "Saída permitida" });
    })();
});

app.listen(3004, () => console.log('Controle de Acesso rodando na porta 3004'));
