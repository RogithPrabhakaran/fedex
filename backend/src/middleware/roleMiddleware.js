/**
 * Role-Based Access Control Middleware
 * 
 * Provides middleware functions for enforcing role-based access control
 * in the 3-tier DCA system (FEDEX_ADMIN, DCA_ADMIN, DCA_AGENT).
 */

/**
 * Check if user has one of the allowed roles
 * @param {...string} allowedRoles - Roles that are allowed access
 * @returns {Function} Express middleware
 */
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: `This endpoint requires one of the following roles: ${allowedRoles.join(', ')}`,
        userRole: req.user.role 
      });
    }
    
    next();
  };
};

/**
 * Ensure DCA Admin can only access their own DCA's data
 * Middleware should be used after checkRole('DCA_ADMIN')
 */
const checkDcaAccess = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // FedEx Admin has access to everything
  if (req.user.role === 'FEDEX_ADMIN') {
    return next();
  }

  // DCA Admin: set dca_id filter
  if (req.user.role === 'DCA_ADMIN') {
    if (!req.user.dca_id) {
      return res.status(403).json({ error: 'DCA Admin must have dca_id set' });
    }
    req.dcaId = req.user.dca_id;
    return next();
  }

  // DCA Agent: set agent_id and dca_id filters
  if (req.user.role === 'DCA_AGENT') {
    if (!req.user.dca_id) {
      return res.status(403).json({ error: 'DCA Agent must have dca_id set' });
    }
    req.agentId = req.user.id;
    req.dcaId = req.user.dca_id;
    return next();
  }

  return res.status(403).json({ error: 'Invalid role' });
};

/**
 * Ensure DCA Agent can only access their assigned cases
 * Should be used for agent-specific endpoints
 */
const checkAgentAccess = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (req.user.role !== 'DCA_AGENT') {
    return res.status(403).json({ 
      error: 'Access denied',
      message: 'This endpoint is only for DCA agents' 
    });
  }

  // Set agent_id for filtering
  req.agentId = req.user.id;
  req.dcaId = req.user.dca_id;

  next();
};

/**
 * Verify case belongs to the requesting user's scope
 * @param {Object} caseData - Case object to verify
 * @param {Object} user - User object from req.user
 * @returns {boolean} - Whether user has access to this case
 */
const verifyCaseAccess = (caseData, user) => {
  // FedEx Admin can access all cases
  if (user.role === 'FEDEX_ADMIN') {
    return true;
  }

  // DCA Admin can access cases from their DCA
  if (user.role === 'DCA_ADMIN') {
    return caseData.dca_id === user.dca_id;
  }

  // DCA Agent can only access their assigned cases
  if (user.role === 'DCA_AGENT') {
    return caseData.agent_id === user.id;
  }

  return false;
};

module.exports = {
  checkRole,
  checkDcaAccess,
  checkAgentAccess,
  verifyCaseAccess,
};
