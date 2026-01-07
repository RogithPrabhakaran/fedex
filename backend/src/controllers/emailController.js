const { EmailTemplate, Customer } = require('../models');
const nodemailer = require('nodemailer');

const emailController = {
  async getAllTemplates(req, res) {
    try {
      const templates = await EmailTemplate.findAll({
        order: [['createdAt', 'DESC']],
      });
      res.json(templates);
    } catch (error) {
      console.error('Get all templates error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch templates' });
    }
  },

  async getTemplateById(req, res) {
    try {
      const template = await EmailTemplate.findByPk(req.params.id);
      
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      res.json(template);
    } catch (error) {
      console.error('Get template by ID error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch template' });
    }
  },

  async createTemplate(req, res) {
    try {
      const { name, subject, body, description } = req.body;
      
      if (!name || !subject || !body) {
        return res.status(400).json({ error: 'Name, subject, and body are required' });
      }

      const template = await EmailTemplate.create(req.body);
      res.status(201).json(template);
    } catch (error) {
      console.error('Create template error:', error);
      res.status(500).json({ error: error.message || 'Failed to create template' });
    }
  },

  async updateTemplate(req, res) {
    try {
      const [updated] = await EmailTemplate.update(req.body, {
        where: { id: req.params.id },
      });

      if (!updated) {
        return res.status(404).json({ error: 'Template not found' });
      }

      const template = await EmailTemplate.findByPk(req.params.id);
      res.json(template);
    } catch (error) {
      console.error('Update template error:', error);
      res.status(500).json({ error: error.message || 'Failed to update template' });
    }
  },

  async deleteTemplate(req, res) {
    try {
      const deleted = await EmailTemplate.destroy({
        where: { id: req.params.id },
      });

      if (!deleted) {
        return res.status(404).json({ error: 'Template not found' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Delete template error:', error);
      res.status(500).json({ error: error.message || 'Failed to delete template' });
    }
  },

  async sendEmail(req, res) {
    try {
      const { templateId, customerIds, customSubject, customBody } = req.body;
      
      if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
        return res.status(400).json({ error: 'customerIds array is required' });
      }

      if (!templateId && !customSubject && !customBody) {
        return res.status(400).json({ error: 'Either templateId or customSubject/customBody is required' });
      }
      
      let template = null;
      if (templateId) {
        template = await EmailTemplate.findByPk(templateId);
        if (!template) {
          return res.status(404).json({ error: 'Template not found' });
        }
      }

      // Validate email configuration
      if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        return res.status(500).json({ error: 'Email service is not configured' });
      }

      const transporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 587,
        secure: process.env.EMAIL_PORT === '465',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Verify transporter configuration
      try {
        await transporter.verify();
      } catch (verifyError) {
        console.error('Email transporter verification failed:', verifyError);
        return res.status(500).json({ error: 'Email service configuration is invalid' });
      }

      const results = [];
      
      for (const customerId of customerIds) {
        const customer = await Customer.findByPk(customerId);
        if (!customer) {
          results.push({ customerId, status: 'failed', error: 'Customer not found' });
          continue;
        }

        let subject = customSubject || template?.subject || 'FedEx Communication';
        let body = customBody || template?.body || '';

        // Replace placeholders
        subject = subject.replace(/{{ContactName}}/g, customer.name)
                        .replace(/{{AccountID}}/g, customer.accountId)
                        .replace(/{{Status}}/g, customer.status)
                        .replace(/{{DebtAmount}}/g, `$${customer.totalDebt}`);

        body = body.replace(/{{ContactName}}/g, customer.name)
                  .replace(/{{AccountID}}/g, customer.accountId)
                  .replace(/{{Status}}/g, customer.status)
                  .replace(/{{DebtAmount}}/g, `$${customer.totalDebt}`);

        try {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: customer.contactEmail,
            subject,
            text: body,
          });
          
          results.push({ customerId, status: 'sent' });
        } catch (emailError) {
          console.error(`Failed to send email to customer ${customerId}:`, emailError.message);
          results.push({ customerId, status: 'failed', error: emailError.message });
        }
      }

      res.json({ results });
    } catch (error) {
      console.error('Send email error:', error);
      res.status(500).json({ error: error.message || 'Failed to send emails' });
    }
  },
};

module.exports = emailController;
