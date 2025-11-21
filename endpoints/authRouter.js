const express = require('express');
const router = express.Router();

router.post('/login', require('./auth/login'));
router.post('/register', require('./auth/register'));

module.exports = router;