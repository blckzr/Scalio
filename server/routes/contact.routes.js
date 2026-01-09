const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller');
const { body } = require('express-validator');

const validateContact = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({min: 2, max: 100}).withMessage('Name must be 2-100 Characters'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format'),

    body('subject')
        .optional()
        .trim()
        .isLength({max: 200}).withMessage('Subject max 200 characters'),

    body('message')
        .trim()
        .notEmpty().withMessage('Message is required')
        .isLength({min: 10, max:2000}).withMessage('Message must be 10-2000 characters'),
];

router.post('/', validateContact, contactController.submitContactForm);

router.get('/', contactController.getAllMessages);

router.get('/:id', contactController.getMessageById);

router.patch('/:id/status', contactController.updateMessageStatus);

module.exports = router;