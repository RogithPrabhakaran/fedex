const { DcaAgent, User, Case, CaseLog, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all agents for the logged-in DCA Admin
 * GET /api/dca/agents
 */
exports.getAllAgents = async (req, res) => {
  try {
    const dcaAdminId = req.user.id;

    const agents = await DcaAgent.findAll({
      where: { dca_admin_id: dcaAdminId },
      include: [
        {
          model: User,
          as: 'userAccount',
          attributes: ['id', 'email', 'status'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    // Calculate stats for each agent
    const agentsWithStats = await Promise.all(
      agents.map(async (agent) => {
        const assignedCases = await Case.count({
          where: { agent_id: agent.id },
        });

        const recoveredCases = await Case.count({
          where: {
            agent_id: agent.id,
            status: 'RECOVERED',
          },
        });

        const recoveryRate = assignedCases > 0 
          ? ((recoveredCases / assignedCases) * 100).toFixed(2)
          : 0.00;

        return {
          id: agent.id,
          name: agent.name,
          email: agent.email,
          phone: agent.phone,
          status: agent.status,
          assigned_cases: assignedCases,
          recovery_rate: parseFloat(recoveryRate),
          user_account: agent.userAccount,
          createdAt: agent.createdAt,
          updatedAt: agent.updatedAt,
        };
      })
    );

    res.json(agentsWithStats);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
};

/**
 * Create a new agent
 * POST /api/dca/agents
 */
exports.createAgent = async (req, res) => {
  try {
    const dcaAdminId = req.user.id;
    const { name, email, phone, sendLoginEmail } = req.body;

    // Validation
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Check if email already exists
    const existingAgent = await DcaAgent.findOne({ where: { email } });
    if (existingAgent) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Create agent
    const agent = await DcaAgent.create({
      name,
      email,
      phone,
      dca_admin_id: dcaAdminId,
      status: 'ACTIVE',
      assigned_cases_count: 0,
      recovery_rate: 0.00,
    });

    // TODO: If sendLoginEmail is true, create User account and send email
    if (sendLoginEmail) {
      console.log('TODO: Send login email to', email);
      // This would create a User account with DCA_AGENT role
      // and send credentials via email
    }

    res.status(201).json(agent);
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ error: 'Failed to create agent' });
  }
};

/**
 * Update an agent
 * PUT /api/dca/agents/:id
 */
exports.updateAgent = async (req, res) => {
  try {
    const dcaAdminId = req.user.id;
    const agentId = req.params.id;
    const { name, email, phone, status } = req.body;

    // Find agent and verify ownership
    const agent = await DcaAgent.findOne({
      where: {
        id: agentId,
        dca_admin_id: dcaAdminId,
      },
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found or unauthorized' });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== agent.email) {
      const existingAgent = await DcaAgent.findOne({ where: { email } });
      if (existingAgent) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    // Update agent
    await agent.update({
      name: name || agent.name,
      email: email || agent.email,
      phone: phone !== undefined ? phone : agent.phone,
      status: status || agent.status,
    });

    res.json(agent);
  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(500).json({ error: 'Failed to update agent' });
  }
};

/**
 * Delete an agent
 * DELETE /api/dca/agents/:id
 */
exports.deleteAgent = async (req, res) => {
  try {
    const dcaAdminId = req.user.id;
    const agentId = req.params.id;

    // Find agent and verify ownership
    const agent = await DcaAgent.findOne({
      where: {
        id: agentId,
        dca_admin_id: dcaAdminId,
      },
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found or unauthorized' });
    }

    // Check if agent has assigned cases
    const assignedCases = await Case.count({
      where: { agent_id: agentId },
    });

    if (assignedCases > 0) {
      return res.status(400).json({
        error: `Cannot delete agent with ${assignedCases} assigned cases. Please reassign cases first.`,
      });
    }

    // Delete agent
    await agent.destroy();

    res.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Error deleting agent:', error);
    res.status(500).json({ error: 'Failed to delete agent' });
  }
};

/**
 * Get agent statistics
 * GET /api/dca/agents/:id/stats
 */
exports.getAgentStats = async (req, res) => {
  try {
    const dcaAdminId = req.user.id;
    const agentId = req.params.id;

    // Verify agent belongs to this DCA Admin
    const agent = await DcaAgent.findOne({
      where: {
        id: agentId,
        dca_admin_id: dcaAdminId,
      },
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found or unauthorized' });
    }

    // Get total cases
    const totalCases = await Case.count({
      where: { agent_id: agentId },
    });

    // Get active cases (not RECOVERED or WRITE_OFF)
    const activeCases = await Case.count({
      where: {
        agent_id: agentId,
        status: {
          [Op.notIn]: ['RECOVERED', 'WRITE_OFF'],
        },
      },
    });

    // Get recovered cases
    const recoveredCases = await Case.count({
      where: {
        agent_id: agentId,
        status: 'RECOVERED',
      },
    });

    // Calculate recovery rate
    const recoveryRate = totalCases > 0
      ? ((recoveredCases / totalCases) * 100).toFixed(2)
      : 0.00;

    // Calculate average days per case
    const cases = await Case.findAll({
      where: {
        agent_id: agentId,
        status: 'RECOVERED',
      },
      attributes: ['assigned_at', 'updatedAt'],
    });

    let avgDaysPerCase = 0;
    if (cases.length > 0) {
      const totalDays = cases.reduce((sum, c) => {
        const days = Math.floor((new Date(c.updatedAt) - new Date(c.assigned_at)) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0);
      avgDaysPerCase = Math.round(totalDays / cases.length);
    }

    res.json({
      total_cases: totalCases,
      active_cases: activeCases,
      recovered_cases: recoveredCases,
      recovery_rate: parseFloat(recoveryRate),
      avg_days_per_case: avgDaysPerCase,
    });
  } catch (error) {
    console.error('Error fetching agent stats:', error);
    res.status(500).json({ error: 'Failed to fetch agent stats' });
  }
};

/**
 * Get agent progress (for progress modal)
 * GET /api/dca/agents/:id/progress
 */
exports.getAgentProgress = async (req, res) => {
  try {
    const dcaAdminId = req.user.id;
    const agentId = req.params.id;

    // Verify agent belongs to this DCA Admin
    const agent = await DcaAgent.findOne({
      where: {
        id: agentId,
        dca_admin_id: dcaAdminId,
      },
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found or unauthorized' });
    }

    // Get agent stats
    const totalCases = await Case.count({
      where: { agent_id: agentId },
    });

    const recoveredCases = await Case.count({
      where: {
        agent_id: agentId,
        status: 'RECOVERED',
      },
    });

    const recoveryRate = totalCases > 0
      ? ((recoveredCases / totalCases) * 100).toFixed(2)
      : 0.00;

    // Calculate average days per case
    const cases = await Case.findAll({
      where: {
        agent_id: agentId,
        status: 'RECOVERED',
      },
      attributes: ['assigned_at', 'updatedAt'],
    });

    let avgDaysPerCase = 0;
    if (cases.length > 0) {
      const totalDays = cases.reduce((sum, c) => {
        const days = Math.floor((new Date(c.updatedAt) - new Date(c.assigned_at)) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0);
      avgDaysPerCase = Math.round(totalDays / cases.length);
    }

    // Get status breakdown
    const statusBreakdown = await Case.findAll({
      where: { agent_id: agentId },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('case_id')), 'count'],
      ],
      group: ['status'],
      raw: true,
    });

    const statusMap = {};
    statusBreakdown.forEach((item) => {
      statusMap[item.status] = parseInt(item.count);
    });

    // Get 30-day performance data (simplified - you can enhance this)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const casesWorked = await Case.count({
      where: {
        agent_id: agentId,
        assigned_at: {
          [Op.gte]: thirtyDaysAgo,
        },
      },
    });

    const casesRecovered = await Case.count({
      where: {
        agent_id: agentId,
        status: 'RECOVERED',
        updatedAt: {
          [Op.gte]: thirtyDaysAgo,
        },
      },
    });

    // Get recent activity from CaseLog
    const recentActivity = await CaseLog.findAll({
      where: {
        actor: agent.name,
      },
      include: [
        {
          model: Case,
          as: 'case',
          where: { agent_id: agentId },
          attributes: ['case_id'],
        },
      ],
      order: [['created_at', 'DESC']],
      limit: 10,
    });

    res.json({
      agent: {
        id: agent.id,
        name: agent.name,
        email: agent.email,
        total_cases: totalCases,
        recovery_rate: parseFloat(recoveryRate),
        avg_days_per_case: avgDaysPerCase,
        status_breakdown: statusMap,
        performance_data: {
          dates: ['Day 1', 'Day 5', 'Day 10', 'Day 15', 'Day 20', 'Day 25', 'Day 30'],
          cases_worked: [0, 0, 0, 0, 0, 0, casesWorked],
          cases_recovered: [0, 0, 0, 0, 0, 0, casesRecovered],
        },
      },
      recent_activity: recentActivity.map((log) => ({
        log_id: log.log_id,
        date: log.created_at,
        case_id: log.case_id,
        action_type: log.action_type,
        description: log.description,
      })),
    });
  } catch (error) {
    console.error('Error fetching agent progress:', error);
    res.status(500).json({ error: 'Failed to fetch agent progress' });
  }
};
