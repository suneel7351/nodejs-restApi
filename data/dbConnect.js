import mongoose from "mongoose";
mongoose.set("strictQuery", false);
const connection = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGO_URI);
    console.log(`DataBase connected -- ${connect.connection.host}`);
  } catch (error) {
    console.log(`Some Error occured -- ${error}`);
    process.exit(1);
  }
};

export default connection;
