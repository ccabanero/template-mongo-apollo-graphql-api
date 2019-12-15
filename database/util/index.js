const mongoose = require('mongoose');

module.exports.connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URL,
      { useNewUrlParser: true, useUnifiedTopology: true });

    // eslint-disable-next-line no-console
    console.log('Database connected successfully');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
    throw error;
  }
};

module.exports.isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
