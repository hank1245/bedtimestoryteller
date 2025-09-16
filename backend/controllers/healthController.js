export const getHealthStatus = (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
};

export const getRootInfo = (req, res) => {
  res.json({
    message: "Storyteller API",
    version: "1.0.0",
    status: "running",
  });
};
