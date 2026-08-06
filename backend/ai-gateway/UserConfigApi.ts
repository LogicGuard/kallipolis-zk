import { Router } from 'express';
import { getGatewayConfig, updateGatewayConfig, GatewayConfig } from '../../services/kallipolisGateway';

export const ModelConfigRouter = Router();

// Get all available models for user
ModelConfigRouter.get('/api/v1/models', async (req, res) => {
    // In a real app this would fetch per-user config from a DB
    // Here we use the singleton global config
    const config = getGatewayConfig();
    res.json({
        config,
        success: true
    });
});

// GET endpoint specifically for the AIGatewayView.tsx config
ModelConfigRouter.get('/api/v1/models/config', async (req, res) => {
    const config = getGatewayConfig();
    res.json(config);
});

// Update model config (via PUT)
ModelConfigRouter.put('/api/v1/models/config', async (req, res) => {
    const { config } = req.body;
    updateGatewayConfig(config as Partial<GatewayConfig>);
    res.json({ success: true });
});

// Update model config (via POST, directly passing config object)
ModelConfigRouter.post('/api/v1/models/config', async (req, res) => {
    const config = req.body;
    updateGatewayConfig(config as Partial<GatewayConfig>);
    res.json({ success: true });
});

// Test connection
ModelConfigRouter.post('/api/v1/models/test', async (req, res) => {
    const { provider, modelName } = req.body;
    try {
        // Just a mock response for now to simulate connection testing
        res.json({ 
            success: true, 
            result: `Successfully connected to ${provider} using model ${modelName}` 
        });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});
