const httpProxy = require('express-http-proxy');
const express = require('express');
const app = express();
var logger = require('morgan');

app.use(logger('dev'));

function selectProxyHost(req) {
    if (req.path.startsWith('/usuarios'))
        return 'http://localhost:3001/';
    else if (req.path.startsWith('/acesso'))
        return 'http://localhost:3004/';
    else if (req.path.startsWith('/creditos'))
        return 'http://localhost:3002/';
    else if (req.path.startsWith('/vagas'))
        return 'http://localhost:3003/';
    else return null;
}

app.use((req, res, next) => {
    var proxyHost = selectProxyHost(req);
    if (proxyHost == null)
        res.status(404).send('Not found');
    else
        httpProxy(proxyHost)(req, res, next);
});

app.listen(3006, () => {
    console.log('API Gateway iniciado!');
});