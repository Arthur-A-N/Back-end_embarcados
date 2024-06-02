const express = require('express');
const app = express();

app.use(express.json());

app.post('/cancela/abrir', (req, res) => {
    const { tipo } = req.body;
    if (tipo === 'entrada') {
        console.log('Abrindo cancela para entrada...');
    } else if (tipo === 'saida') {
        console.log('Abrindo cancela para saída...');
    }
    res.status(200).send({ message: 'Cancela aberta' });
});

app.listen(3005, () => console.log('Controle de Cancela rodando na porta 3005'));
