var config = require('../config/config');
var response = require('../config/responses');
var commonHelpers = require('../helpers/commonHelpers');
var ObjectId = require('mongodb').ObjectId;
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');


const userSignup = async (req, res) => {
    // name (Full name)
    // password
    // email
    try {
        // database object setup
        const db = req.app.locals.db;
        let dba = db.db(config.ambition_db);

        // request parameters
        let email = req.body.email;
        let name = req.body.name;
        let password = req.body.password;
        let mobile = req.body.mobile;

        // validating request parameters
        let isEmailValid = await commonHelpers.validateEmail(email);
        let isNameValid = await commonHelpers.validateName(name);
        let isMobileValid = await commonHelpers.validateMobile(mobile);
        // if want can add formatting to use entered value. i.e. can make its first letter capital and other small of name. (example - entered value -> 'suprIYa paTil' format to -> 'Supriya Patil')

        if (isEmailValid && isNameValid && password && isMobileValid) {
            let dataObj = {
                email,
                name,
                password: bcrypt.hashSync(password, 8),
                mobile
            }

            // inserting into database
            let result = await dba.collection(config.userCollection).insertOne(dataObj);
            if (result.insertedCount) {
                res.status(200).send(response.successful_signup)
            } else {
                res.status(400).send(response.failed_to_signup)
            }
        } else {
            res.status(400).send(response.invalid_parameters)

        }
    } catch (error) {
        res.status(400).send({
            msg: error.errmsg
        })
    }
}

module.exports.userSignup = userSignup;

const userLogin = async (req, res) => {
    try {
        // database object setup
        const db = req.app.locals.db;
        let dba = db.db(config.ambition_db);

        var email = req.body.email;
        var password = req.body.password;

        if (email && password) {
            //retrieving data from db
            let result = await dba.collection(config.userCollection).find({
                email: req.body.email
            }).project({
                password: 1
            }).toArray();

            if (result.length) {
                let passwordIsValid = bcrypt.compareSync(req.body.password, result[0].password);
                if (!passwordIsValid) return res.status(401).send({
                    auth: false,
                    token: null
                });

                let token = jwt.sign({
                    id: result[0]._id
                }, config.secret, {
                    expiresIn: 86400 // expires in 24 hours
                });
                app.locals.email = email;

                res.status(200).send({
                    auth: true,
                    token: token
                });
            } else {
                res.status(400).send(response.invalid_loggin_credentials);
            }
        } else {
            res.status(400).send(response.invalid_loggin_credentials);
        }
    } catch (error) {
        res.status(400).send({
            msg: error.errmsg
        });
    }

}

module.exports.userLogin = userLogin;


const getContacts = async (req, res) => {
    try {
        // database object setup
        const db = req.app.locals.db;
        let dba = db.db(config.ambition_db);

        let id = req.query.id;
        query = {};

        if (id) {
            query = {
                _id: ObjectId(id)
            }
        }

        // retrieving all tasks' data from database
        let result = await dba.collection(config.userCollection).find().toArray();
        if (result.length) {
            sendEmail("Fetched all/specific contact from database")
            res.status(200).send({
                data: result
            });
        } else {
            res.status(400).send(response.no_data_found);
        }
    } catch (error) {
        res.status(400).send({
            msg: error.errmsg
        });
    }
}

module.exports.getContacts = getContacts;

const updateContacts = async (req, res) => {
    // update chat details
    // chatId
    try {
        // database object setup
        const db = req.app.locals.db;
        let dba = db.db(config.ambition_db);

        // request body
        
        let contactId = req.body.contactId;
        let updatedData = req.body;
        delete updatedData["contactId"];

        if (contactId) {
            // update the database
            let result = await dba.collection(config.userCollection).updateOne({
                _id: ObjectId(contactId)
            }, {
                $set: updatedData
            });
            if (result.modifiedCount) {
                sendEmail("Data updated by the user for user ID -> "+ contactId)
                res.status(200).send(response.successful_update);
            } else {
                res.status(400).send(response.no_data_found);
            }
        } else {
            res.status(400).send(response.invalid_parameters)
        }
    } catch (error) {
        res.status(400).send({
            msg: error
        });
    }

}

module.exports.updateContacts = updateContacts;

const createContacts = async (req, res) => {
    try {

        // request parameters
        let name = req.body.name;
        let mobile = req.body.mobile;
        let email = req.body.email;

        //database object setup
        const db = req.app.locals.db;
        let dba = db.db(config.ambition_db);

        var data_obj = {
            name,
            mobile,
            email
        }
        var result = await dba.collection(config.userCollection).insertOne(data_obj);
        if (result.insertedCount) {
            sendEmail("New contact created by the user having email "+email)
            res.status(200).send(response.successful_insert)
        } else {
            res.status(400).send(response.failed_to_insert)
        }

    } catch (error) {
        res.status(400).send({
            msg: error.errmsg
        })
    }

    // res.send("In create")
}

module.exports.createContacts = createContacts;

const deleteContacts = async (req, res) => {
    try {
        // database object setup
        const db = req.app.locals.db;
        let dba = db.db(config.ambition_db);

        // request params
        let contactId = req.body.contactId;

        if (contactId) {
            // deleteing task from database using taskId
            let result = await dba.collection(config.userCollection).deleteOne({
                _id: ObjectId(contactId)
            });
            if (result.deletedCount) {
                sendEmail("Deleted user having ID -> "+contactId);
                res.status(200).send(response.successful_delete);
            } else {
                res.status(400).send(response.no_data_found);
            }
        } else {
            res.status(400).send(response.invalid_parameters)
        }
    } catch (error) {
        res.status(400).send({
            msg: error.errmsg
        });
    }

}

module.exports.deleteContacts = deleteContacts;

const forgotPassword = async(req, res) =>{
    try {
        let email = req.body.email;
        const db = req.app.locals.db;
        let dba = db.db(config.ambition_db);
        
        let result = await dba.collection(config.userCollection).find({email: email}).toArray();
        if(result.length){
            let otp = Math.floor(Math.random() * 4);
            let otpsuccess = await dba.collection(config.userCollection).updateOne({email: email}, {$set: {otp: otp}});
            if(otpsuccess.modifiedCount){
                sendEmail("Here is your one time password -> "+otp);
                res.send(200)
            } else {
                res.send(400)
            }
        } else {
            res.send(400);
        }

    } catch (error) {
        res.send(400)
    }

}

module.exports.forgotPassword = forgotPassword;


const verifyOtp = async(req, res) => {
    try {
        let otp = req.body.otp;
        let email = req.body.email;

        const db = req.app.locals.db;
        let dba = db.db(config.ambition_db);

        if(otp && email){
            let result = await dba.collection(config.userCollection).find({email: email, otp: otp}).toArray();
            if(result.length){
                res.send(200)
            } else {
                res.send(400)
            }
        } else {
            res.status(400).send("Invalid parameters")
        }
    } catch (error) {
        res.send(400)
    }
}

module.exports.verifyOtp = verifyOtp;


function sendEmail(text) {
    // Node_Mailer Implementation

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'youremail@gmail.com',
            pass: 'yourpassword'
        }
    });

    var mailOptions = {
        from: 'youremail@gmail.com',
        to: req.app.locals.email,
        subject: 'Operations performed by User',
        text: text
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}