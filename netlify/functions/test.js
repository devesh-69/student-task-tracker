// Simple test function to verify Netlify Functions work
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      success: true,
      message: "Netlify Function is working!",
      timestamp: new Date().toISOString(),
      environment: {
        hasMongoUri: !!process.env.MONGODB_URI,
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasEncryptionSecret: !!process.env.ENCRYPTION_SECRET,
        nodeEnv: process.env.NODE_ENV || "not set",
      },
      request: {
        method: event.httpMethod,
        path: event.path,
      },
    }),
  };
};
