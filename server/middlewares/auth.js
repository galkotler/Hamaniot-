function verifySession(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: 'משתמש לא מחובר' });
  }
  next();
}

function authorizeRoles(allowedRoles) {
  return function (req, res, next) {
    const user = req.session.user;
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: 'אין הרשאה מתאימה' });
    }
    next();
  };
}

module.exports = { verifySession, authorizeRoles };
