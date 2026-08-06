const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const generateRouteIndex = code.indexOf('app.post("/api/v1/ai/generate"');
if (generateRouteIndex === -1) {
  console.log("Could not find /api/v1/ai/generate");
  process.exit(1);
}

const newRoute = `
  // AI Gateway Consensus Engine Route
  app.post("/api/v1/ai/consensus", async (req, res) => {
    try {
      const { data, analysisType } = req.body;
      const { consensusEngine } = await import("./backend/ai-gateway/ConsensusEngine.js");
      const verdict = await consensusEngine.getVerdict(data, analysisType);
      res.json({ verdict });
    } catch (error: any) {
      console.error("[AI Consensus Error]", error);
      res.status(500).json({ error: error.message });
    }
  });
`;

code = code.slice(0, generateRouteIndex) + newRoute + code.slice(generateRouteIndex);

fs.writeFileSync('server.ts', code);
console.log("Updated server.ts with consensus endpoint");
