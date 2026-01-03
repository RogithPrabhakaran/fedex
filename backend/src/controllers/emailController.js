const { EmailTemplate, Customer } = require('../models');
const nodemailer = require('nodemailer');

const emailController = {
  async getAllTemplates(req, res) {
    try {
      const templates = await EmailTemplate.findAll();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: error.message });
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
      res.status(500).json({ error: error.message });
    }
  },

  async createTemplate(req, res) {
    try {
      const template = await EmailTemplate.create(req.body);
      res.status(201).json(template);
    } catch (error) {
      res.status(500).json({ error: error.message });
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
      res.status(500).json({ error: error.message });
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
      res.status(500).json({ error: error.message });
    }
  },

  async sendEmail(req, res) {
    try {
      const { templateId, customerIds, customSubject, customBody } = req.body;
      
      let template = null;
      if (templateId) {
        template = await EmailTemplate.findByPk(templateId);
        if (!template) {
          return res.status(404).json({ error: 'Template not found' });
        }
      }

      const transporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const results = [];
      
      for (const customerId of customerIds) {
        const customer = await Customer.findByPk(customerId);
        if (!customer) continue;

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
          results.push({ customerId, status: 'failed', error: emailError.message });
        }
      }

      res.json({ results });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = emailController;
