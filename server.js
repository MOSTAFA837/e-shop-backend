import * as dotenv from "dotenv";
import app from "./app.js";
import connectDatabase from "./db/database.js";

// handling uncaught exception
process.on("uncaughtException", (err) => {
  console.log(
    `shutting down the server for handling uncaught exception: ${err.message}`
  );
});

// config
// if (process.env.NODE_ENV !== "PRODUCTION") {
dotenv.config();
// }

// connect db
connectDatabase();

// server
const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});

// unhandled promise rejection
process.on("unhandledRejection", (err) => {
  console.log(
    `shutting down the server for unhandled promise rejection : ${err.message}`
  );

  server.close(() => process.exit(1));
});
