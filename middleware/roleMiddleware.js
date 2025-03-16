export const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access forbidden. Required roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

// Usage example:
// router.get('/admin', roleMiddleware(['ADMIN']), adminController);
