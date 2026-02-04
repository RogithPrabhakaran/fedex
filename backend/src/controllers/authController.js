const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authController = {
  async register(req, res) {
    try {
      if (!process.env.JWT_SECRET) {
        return res.status(500).json({ error: 'Server configuration error' });
      }

      const { email, password, name, role, agencyId } = req.body;
      
      // Validate required fields
      if (!email || !password || !name || !role) {
        return res.status(400).json({ error: 'Missing required fields: email, password, name, role' });
      }

      // Validate role
      if (!['FEDEX_ADMIN', 'DCA_ADMIN', 'DCA_AGENT'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role. Must be FEDEX_ADMIN, DCA_ADMIN, or DCA_AGENT' });
      }
      
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = await User.create({
        email,
        password: hashedPassword,
        name,
        role,
        agencyId,
      });

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
      
      res.status(201).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
          agencyId: user.agencyId, // legacy
          dca_id: user.dca_id,
          parent_dca_admin_id: user.parent_dca_admin_id,
          status: user.status,
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: error.message || 'Registration failed' });
    }
  },

  async login(req, res) {
    try {
      if (!process.env.JWT_SECRET) {
        return res.status(500).json({ error: 'Server configuration error' });
      }

      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
      
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
      
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
          agencyId: user.agencyId, // legacy
          dca_id: user.dca_id,
          parent_dca_admin_id: user.parent_dca_admin_id,
          status: user.status,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: error.message || 'Login failed' });
    }
  },
};

module.exports = authController;
