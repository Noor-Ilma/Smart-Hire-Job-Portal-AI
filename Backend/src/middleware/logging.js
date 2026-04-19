const loggingMiddleware = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const { method, path, ip } = req;

  console.log(`[${timestamp}] ${method} ${path} from ${ip}`);

  next();
};

module.exports = { loggingMiddleware };