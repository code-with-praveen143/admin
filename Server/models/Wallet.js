const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    enum: ['Credit', 'Debit'], // Transaction type
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now, // Date of transaction
  },
  description: {
    type: String, // Optional description of the transaction
  },
});

const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the User model
      ref: 'User',
      required: true,
    },
    username: {
      type: String,
      required: true, // Make this required if necessary
    },
    balance: {
      type: Number,
      default: 0, // Initial balance
    },
    transactions: [transactionSchema],
  },
  { timestamps: true } // Automatically manage createdAt and updatedAt fields
);

// Create the Wallet model
const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;
