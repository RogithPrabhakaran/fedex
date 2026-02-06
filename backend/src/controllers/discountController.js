const { DiscountRequest, Customer } = require('../models');
const { Op } = require('sequelize');
const Joi = require('joi');

const discountController = {
    // Create a new discount request
    async createDiscountRequest(req, res) {
        try {
            const schema = Joi.object({
                customerId: Joi.string().uuid().required(),
                customerName: Joi.string().required(),
                contactEmail: Joi.string().email().required(),
                requestedAmount: Joi.number().min(0).required(),
                reason: Joi.string().min(10).required(),
            });

            const { error, value } = schema.validate(req.body);
            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }

            const discountRequest = await DiscountRequest.create(value);
            res.status(201).json(discountRequest);
        } catch (error) {
            console.error('Create discount request error:', error);
            res.status(500).json({ error: error.message || 'Failed to create discount request' });
        }
    },

    // Get all discount requests with optional filters
    async getDiscountRequests(req, res) {
        try {
            const { status, customerId, limit = 100, offset = 0 } = req.query;
            const where = {};

            if (status) where.status = status;
            if (customerId) where.customerId = customerId;

            const discountRequests = await DiscountRequest.findAll({
                where,
                include: [{
                    model: Customer,
                    as: 'customer',
                    attributes: ['id', 'name', 'accountId', 'contactEmail'],
                }],
                order: [['createdAt', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset),
            });

            res.json(discountRequests);
        } catch (error) {
            console.error('Get discount requests error:', error);
            res.status(500).json({ error: error.message || 'Failed to fetch discount requests' });
        }
    },

    // Get discount requests for a specific customer
    async getDiscountRequestsByCustomer(req, res) {
        try {
            const { customerId } = req.params;

            const discountRequests = await DiscountRequest.findAll({
                where: { customerId },
                order: [['createdAt', 'DESC']],
            });

            res.json(discountRequests);
        } catch (error) {
            console.error('Get customer discount requests error:', error);
            res.status(500).json({ error: error.message || 'Failed to fetch customer discount requests' });
        }
    },

    // Update discount request status (approve/reject)
    async updateDiscountRequest(req, res) {
        try {
            const { id } = req.params;
            const schema = Joi.object({
                status: Joi.string().valid('PENDING', 'APPROVED', 'REJECTED').required(),
                approvedBy: Joi.string().when('status', {
                    is: 'APPROVED',
                    then: Joi.required(),
                    otherwise: Joi.optional(),
                }),
                rejectionReason: Joi.string().when('status', {
                    is: 'REJECTED',
                    then: Joi.required(),
                    otherwise: Joi.optional(),
                }),
            });

            const { error, value } = schema.validate(req.body);
            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }

            const updateData = { ...value };
            if (value.status === 'APPROVED') {
                updateData.approvedAt = new Date();
            }

            const [updated] = await DiscountRequest.update(updateData, {
                where: { id },
            });

            if (!updated) {
                return res.status(404).json({ error: 'Discount request not found' });
            }

            const discountRequest = await DiscountRequest.findByPk(id, {
                include: [{
                    model: Customer,
                    as: 'customer',
                    attributes: ['id', 'name', 'accountId', 'contactEmail'],
                }],
            });

            res.json(discountRequest);
        } catch (error) {
            console.error('Update discount request error:', error);
            res.status(500).json({ error: error.message || 'Failed to update discount request' });
        }
    },
};

module.exports = discountController;
