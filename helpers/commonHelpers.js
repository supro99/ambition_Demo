const validateEmail = (email) => {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
} 

module.exports.validateEmail = validateEmail;


const validateName = (name) => {
    var re = /^[a-zA-Z]+ [a-zA-Z]+$/;
    return re.test(String(name).toLowerCase());
} 

module.exports.validateName = validateName;


const validateMobile = (mobile) => {
    var re = /^(\+\d{1,3}[- ]?)?\d{10}$/;
    return re.test(String(mobile).toLowerCase());
} 

module.exports.validateMobile = validateMobile;