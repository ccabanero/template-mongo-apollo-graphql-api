/* eslint-disable no-console */
const mongoose = require('mongoose');

module.exports.connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URL,
      { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Database connected successfully');
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports.isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
