const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const app = express();
const port = 3000;
const origin_url = 'http://localhost:3000';
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cors({
    origin: origin_url,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
const mockApis = {};
app.post('/create-mock-api', (req, res) => {
    const { exampleResponse } = req.body;
    if (!exampleResponse) return res.status(400).send('Example Response is required');

    const apiId = uuidv4()
    mockApis[apiId] = exampleResponse;
    res.send(`${origin_url}/mock/${apiId}`);
});
app.get('/mock/:apiId', (req, res) => {
    const apiId = req.params.apiId;
    const response = mockApis[apiId];
    if (!response) return res.status(404).send('API not found');
    res.json(JSON.parse(response));
});

app.listen(port, () => {
    console.log(`Mock API Generator running at ${origin_url}`);
});
