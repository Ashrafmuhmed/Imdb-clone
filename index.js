const dotenv = require("dotenv");
const express = require("express");
const morgan = require("morgan");
const logger = require("./utils/logger");

const sequelize = require("./utils/database");
const session = require("express-session");
const sessionStore = require("connect-pg-simple")(session);
const { Pool } = require("pg");
const path = require("path");
const csurf = require("csurf");

const authRoutes = require("./routes/auth.router");
const namesRoutes = require("./routes/names.router");

const seedTestData = require("./seeders/imdb-test-data");
const csurfProtection = csurf();

const isAuth = require('./middleware/isauth.middleware');
const defineAssociations = require("./models/associations");
defineAssociations();

const pgPool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

const sessionMiddleware = session({
  store: new sessionStore({
    pool: pgPool,
    tableName: "Sessions",
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
});

const loggerMiddleware = morgan("combined", {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
});

const app = express();
dotenv.config();

const PORT = process.env.PORT || 3000;

app.use(sessionMiddleware);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(csurfProtection);
app.use(loggerMiddleware);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use((req,res,next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use(authRoutes);
app.use( isAuth , namesRoutes )

sequelize
  .sync({ alter: true })
  .then(() => {
    return seedTestData();
  })
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
