const contactService = require('../services/contact.service');
const { validationResult } = require('express-validator');
const { successResponse, errorResponse} = require('../utils/responseFormatter');
const logger = require('../utils/logger');

const submitContactForm = async(req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return errorResponse(res,'Validation failed', 400, errors.array());
        }
        const{name, email, subject, message} = req.body;

        const result = await contactService.createContactMessage({
            name,
            email,
            subject,
            message,
        });

        if (result.error){
            return errorResponse(res, result.error, 500);
        }

        logger.info(`Contact form submitted by ${email}`);
        return successResponse(
            res,
            {message_id: result.data.message_id},
            'Message sent successfully. We will get back to you soon.'
        );
    } catch(error) {
        logger.error(`Contact form error: ${error.message}`);
    }
};

const getAllMessages = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const result = await contactService.getAllMessages({
      status,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    if (result.error) {
      return errorResponse(res, result.error, 500);
    }

    return successResponse(res, result.data, 'Messages retrieved successfully');

  } catch (error) {
    logger.error(`Get messages error: ${error.message}`);
    next(error);
  }
};

const getMessageById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await contactService.getMessageById(id);

    if (result.error) {
      return errorResponse(res, result.error, result.error.includes('not found') ? 404 : 500);
    }

    return successResponse(res, result.data, 'Message retrieved successfully');

  } catch (error) {
    logger.error(`Get message error: ${error.message}`);
    next(error);
  }
};

const updateMessageStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['new', 'read', 'replied', 'archived'];
    if (!validStatuses.includes(status)) {
      return errorResponse(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    const result = await contactService.updateMessageStatus(id, status);

    if (result.error) {
      return errorResponse(res, result.error, result.error.includes('not found') ? 404 : 500);
    }

    return successResponse(res, result.data, 'Message status updated successfully');

  } catch (error) {
    logger.error(`Update status error: ${error.message}`);
    next(error);
  }
};

module.exports = {
  submitContactForm,
  getAllMessages,
  getMessageById,
  updateMessageStatus
};