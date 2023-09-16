const mongoose = require('mongoose');
const validateId = (id) => {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if(!isValid) throw new Error('ID invalid or unavailable.');
};
module.exports = {validateId}