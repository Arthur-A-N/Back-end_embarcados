const express = require('express');
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

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
        const usuarioStmt = db.prepare('SELECT categoria FROM usuarios WHERE cpf = ?');
        const usuario = usuarioStmt.get(cpf);
        if (!usuario) {
            res.status(404).send({ message: "Usuário não encontrado" });
            return;
        }

        if (usuario.categoria === 'professor' || usuario.categoria === 'TCE') {
            liberarEntrada();
        } else {
            const creditosStmt = db.prepare('SELECT valor FROM creditos WHERE cpf = ?');
            const creditos = creditosStmt.get(cpf);
            if (creditos && creditos.valor >= 1) {
                liberarEntrada();
            } else {
                res.status(403).send({ message: "Não há créditos suficientes para entrada" });
            }
        }

        async function liberarEntrada() {
            const vagasStmt = db.prepare('SELECT vagasDisponiveis FROM vagas WHERE estacionamento = ?');
            const vaga = vagasStmt.get(estacionamento);
            if (vaga.vagasDisponiveis > 0) {
                const updateVagasStmt = db.prepare('UPDATE vagas SET vagasDisponiveis = vagasDisponiveis - 1 WHERE estacionamento = ?');
                updateVagasStmt.run(estacionamento);

                const entradaStmt = db.prepare('INSERT INTO acessos (cpf, estacionamento, tipo, data) VALUES (?, ?, ?, datetime(\'now\'))');
                entradaStmt.run(cpf, estacionamento, 'entrada');

                try {
                    await axios.post('http://localhost:3005/cancela/abrir', { tipo: 'entrada' });
                    res.status(200).send({ message: "Entrada permitida e cancela aberta" });
                } catch (error) {
                    res.status(500).send({ message: "Entrada permitida, mas houve um problema ao abrir a cancela" });
                }
            } else {
                res.status(403).send({ message: "Estacionamento lotado" });
            }
        }
    })();
});

app.post('/acesso/saida', (req, res) => {
    const { cpf, estacionamento } = req.body;
    db.transaction(async () => {
        const saidaStmt = db.prepare('INSERT INTO acessos (cpf, estacionamento, tipo, data) VALUES (?, ?, ?, datetime(\'now\'))');
        saidaStmt.run(cpf, estacionamento, 'saida');

        const updateVagasStmt = db.prepare('UPDATE vagas SET vagasDisponiveis = vagasDisponiveis + 1 WHERE estacionamento = ?');
        updateVagasStmt.run(estacionamento);

        const updateCreditosStmt = db.prepare('UPDATE creditos SET valor = valor - 1 WHERE cpf = ?');
        updateCreditosStmt.run(cpf);

        try {
            await axios.post('http://localhost:3005/cancela/abrir', { tipo: 'saida' });
            res.status(200).send({ message: "Saída permitida e cancela aberta" });
        } catch (error) {
            res.status(500).send({ message: "Saída permitida, mas houve um problema ao abrir a cancela" });
        }
    })();
});

app.listen(3004, () => console.log('Controle de Acesso rodando na porta 3004'));
