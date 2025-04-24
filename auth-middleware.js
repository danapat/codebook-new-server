function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
  
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    const token = authHeader.split(' ')[1];
  
    // Simulate token checking — in real cases you'd verify JWTs here
    if (token === 'devtoken') {
      // Attach a mock user object
      req.user = {
        id: 1,
        username: 'admin',
        role: 'admin'
      };
      return next();
    }
  
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  module.exports = authMiddleware;
  