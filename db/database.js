import mongoose from "mongoose";

const connectDatabase = () => {
  mongoose.connect(process.env.DB_URL).then(() => {
    console.log(`successfully connected to mongodb`);
  });
};

export default connectDatabase;
