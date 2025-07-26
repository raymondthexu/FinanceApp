const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    account_id: {
        type: String,
        required: false,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    main_account_type: {
        type: String,
        required: true
    },
    main_account_category: {
        type: String,
        required: true
    },
    notes: {
        type: String
    },
    balance: {
        type: Number,
        required: true,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Account', AccountSchema); 