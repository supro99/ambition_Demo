var express = require('express');
var router = express.Router();
var userServices = require('../sevices/userServices');
var VerifyToken = require('../auth/verifyToken');

/* GET users listing. */
// Create user.
router.post('/signup', userServices.userSignup);

//User Login API
router.post('/login', userServices.userLogin);

//Get Contacts API
router.get('/', VerifyToken, userServices.getContacts);

//Update Contacts API
router.patch('/', VerifyToken, userServices.updateContacts);

//Create Contacts API
router.post('/', VerifyToken, userServices.createContacts);

//delete Contacts API
router.delete('/', VerifyToken, userServices.deleteContacts);

// forgot password API
router.post('/forgotpassword', userServices.forgotPassword);

// verify otp API
router.post('/verifyotp', userServices.verifyOtp);

module.exports = router;

