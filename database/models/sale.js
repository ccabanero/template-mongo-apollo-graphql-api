const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  categories: [
    {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
  ],
  desc: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Sale', saleSchema);
