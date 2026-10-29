const app = require('./app');
const env = require('./config/env');
const { connectDB } = require('./config/db');

async function startServer() {
  try {
    await connectDB();

    app.listen(env.PORT, () => {
      console.log(`[CogniStock Backend] REST API listening on http://localhost:${env.PORT}`);
      console.log(`[CogniStock Backend] API base URL: http://localhost:${env.PORT}/api/v1`);
      console.log(`[CogniStock Backend] ML microservice URL: ${env.ML_SERVICE_URL}`);
    });
  } catch (err) {
    console.error('[CogniStock Backend] Failed to start server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = startServer;
