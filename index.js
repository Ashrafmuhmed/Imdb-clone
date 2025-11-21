const dotenv = require("dotenv");
const express = require("express");
const morgan = require("morgan");
const logger = require("./utils/logger");

const testRoute = require("./routes/test.route");
const sequelize = require("./utils/database");

const app = express();
dotenv.config();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(testRoute);

app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

sequelize
  .authenticate()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info("Database connected successfully");
    });
  })
  .catch((err) => {
    logger.error(`Database connection failed: ${err.message}`);
    process.exit(1);
  });
