function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `Forbidden. Role '${req.user.role}' does not have sufficient permission for this operation.`
      });
    }

    next();
  };
}

function verifyTenantOwnership(resource, companyId) {
  if (!resource) return false;
  const resCompanyId = resource.companyId ? resource.companyId.toString() : null;
  return resCompanyId === companyId.toString();
}

module.exports = {
  requireRole,
  verifyTenantOwnership
};
