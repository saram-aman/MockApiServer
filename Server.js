const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const app = express();
const port = 3000;
const origin_url = 'https://mock-api-server-one.vercel.app/';

// Enhanced middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cors({
    origin: origin_url,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Database for mock APIs with enhanced properties
const mockApis = {};

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Create mock API with enhanced options
app.post('/create-mock-api', (req, res) => {
    const { 
        exampleResponse, 
        expiresIn,       // Time in minutes until API expires
        statusCode = 200,
        latency = 0,     // Simulated response delay in ms
        requireAuth = false,
        validationRules = [] // Array of rules to validate requests
    } = req.body;
    
    if (!exampleResponse) return res.status(400).send('Example Response is required');
    
    try {
        // Validate JSON format
        JSON.parse(exampleResponse);
        
        const apiId = uuidv4();
        const createdAt = new Date();
        let expiresAt = null;
        
        if (expiresIn) {
            expiresAt = new Date(createdAt.getTime() + expiresIn * 60000); // Convert minutes to milliseconds
        }
        
        mockApis[apiId] = {
            response: exampleResponse,
            createdAt,
            expiresAt,
            statusCode: parseInt(statusCode, 10),
            latency: parseInt(latency, 10),
            requireAuth,
            validationRules,
            requestLog: [],
            hitCount: 0
        };
        
        res.json({
            url: `${origin_url}mock/${apiId}`,
            id: apiId,
            expiresAt,
            dashboardUrl: `${origin_url}dashboard/${apiId}`
        });
    } catch (error) {
        res.status(400).send('Invalid JSON format');
    }
});

// Get API details for dashboard
app.get('/api-details/:apiId', (req, res) => {
    const apiId = req.params.apiId;
    const api = mockApis[apiId];
    
    if (!api) return res.status(404).json({ error: 'API not found' });
    
    // Check if expired
    if (api.expiresAt && new Date() > api.expiresAt) {
        return res.status(410).json({ error: 'API has expired', expiresAt: api.expiresAt });
    }
    
    res.json({
        id: apiId,
        createdAt: api.createdAt,
        expiresAt: api.expiresAt,
        statusCode: api.statusCode,
        latency: api.latency,
        requireAuth: api.requireAuth,
        hitCount: api.hitCount,
        requestLog: api.requestLog.slice(-10) // Return last 10 requests only
    });
});

// Extend API expiration time
app.post('/extend-api/:apiId', (req, res) => {
    const apiId = req.params.apiId;
    const { minutes } = req.body;
    
    if (!mockApis[apiId]) return res.status(404).json({ error: 'API not found' });
    
    const api = mockApis[apiId];
    const baseTime = api.expiresAt || new Date();
    api.expiresAt = new Date(baseTime.getTime() + minutes * 60000);
    
    res.json({ success: true, expiresAt: api.expiresAt });
});

// Update mock API response
app.put('/update-api/:apiId', (req, res) => {
    const apiId = req.params.apiId;
    const { 
        exampleResponse,
        statusCode,
        latency,
        requireAuth,
        validationRules 
    } = req.body;
    
    if (!mockApis[apiId]) return res.status(404).json({ error: 'API not found' });
    
    const api = mockApis[apiId];
    
    // Update only provided fields
    if (exampleResponse) {
        try {
            JSON.parse(exampleResponse);
            api.response = exampleResponse;
        } catch (error) {
            return res.status(400).json({ error: 'Invalid JSON format' });
        }
    }
    
    if (statusCode) api.statusCode = parseInt(statusCode, 10);
    if (latency !== undefined) api.latency = parseInt(latency, 10);
    if (requireAuth !== undefined) api.requireAuth = requireAuth;
    if (validationRules) api.validationRules = validationRules;
    
    res.json({ success: true, message: 'API updated successfully' });
});

// Delete mock API
app.delete('/delete-api/:apiId', (req, res) => {
    const apiId = req.params.apiId;
    
    if (!mockApis[apiId]) return res.status(404).json({ error: 'API not found' });
    
    delete mockApis[apiId];
    res.json({ success: true, message: 'API deleted successfully' });
});

// Handle the mock API request with all enhanced features
app.all('/mock/:apiId', (req, res) => {
    const apiId = req.params.apiId;
    const api = mockApis[apiId];
    
    // API not found
    if (!api) return res.status(404).json({ error: 'API not found' });
    
    // Check if expired
    if (api.expiresAt && new Date() > api.expiresAt) {
        return res.status(410).json({ error: 'API has expired', expiresAt: api.expiresAt });
    }
    
    // Log request
    const requestLog = {
        timestamp: new Date(),
        method: req.method,
        headers: req.headers,
        query: req.query,
        body: req.body,
        ip: req.ip
    };
    
    api.requestLog.push(requestLog);
    // Keep only last 100 requests to prevent excessive memory usage
    if (api.requestLog.length > 100) {
        api.requestLog.shift();
    }
    
    // Increment hit counter
    api.hitCount++;
    
    // Check for required authentication
    if (api.requireAuth && (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer '))) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Check validation rules if they exist
    if (api.validationRules && api.validationRules.length > 0) {
        for (const rule of api.validationRules) {
            // Implement simple rule checking (path exists, field exists, etc.)
            if (rule.type === 'required' && rule.field) {
                const value = getNestedValue(req.body, rule.field);
                if (value === undefined) {
                    return res.status(400).json({ 
                        error: 'Validation failed', 
                        details: `Required field '${rule.field}' is missing` 
                    });
                }
            } else if (rule.type === 'type' && rule.field && rule.value) {
                const value = getNestedValue(req.body, rule.field);
                if (value !== undefined && typeof value !== rule.value) {
                    return res.status(400).json({ 
                        error: 'Validation failed', 
                        details: `Field '${rule.field}' must be of type '${rule.value}'` 
                    });
                }
            }
        }
    }
    
    // Apply simulated latency if specified
    if (api.latency > 0) {
        setTimeout(() => {
            res.status(api.statusCode).json(JSON.parse(api.response));
        }, api.latency);
    } else {
        res.status(api.statusCode).json(JSON.parse(api.response));
    }
});

// Serve the dashboard for a specific API
app.get('/dashboard/:apiId', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Utility function to get nested object values
function getNestedValue(obj, path) {
    const keys = path.split('.');
    return keys.reduce((o, key) => (o && o[key] !== undefined) ? o[key] : undefined, obj);
}

// Clean up expired APIs periodically (every hour)
setInterval(() => {
    const now = new Date();
    Object.keys(mockApis).forEach(apiId => {
        const api = mockApis[apiId];
        if (api.expiresAt && now > api.expiresAt) {
            console.log(`Removing expired API: ${apiId}`);
            delete mockApis[apiId];
        }
    });
}, 3600000); // 1 hour in milliseconds

app.listen(port, () => {
    console.log(`Enhanced Mock API Generator running at ${origin_url}`);
});
