const isValidPhone = (phone) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
};

const isValidName = (name) => {
    return name.trim().length >= 2 && name.trim().length <= 50;
};

module.exports = { isValidPhone, isValidName };