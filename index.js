const dotenv = require("dotenv");
dotenv.config(); // Load environment variables FIRST

const express = require("express");
const morgan = require("morgan");
const logger = require("./utils/logger");

const sequelize = require("./utils/database");
const session = require("express-session");
const sessionStore = require("connect-pg-simple")(session);
const { Pool } = require("pg");
const path = require("path");
const csurf = require("csurf");

const models = require("./models");

const Title = models.title;
const TitleRatings = models.title_ratings;
const TitleCrew = models.title_crew;
const TitleEpisode = models.title_episode;
const TitlePrincipals = models.title_principals;
const Names = models.names;
const Genre = models.genre;
const User = models.user;

const authRoutes = require("./routes/auth.router");
// const namesRoutes = require("./routes/names.router");
// const titlesRoutes = require("./routes/titles.router");
// const searchRoutes = require("./routes/search.router");
// const watchlistRoutes = require("./routes/watchlist.router");

const titlesController = require("./controllers/titles.controller");

const csurfProtection = csurf();

const isAuth = require('./middleware/isauth.middleware');

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
  if(!req.session.user){
    return next() ;
  }
  User.findByPk(req.session.user.userId).then(
    user => {
      if( !user ){
        return next() ;
      }
      console.log("User loaded from session:", user);
      req.user = user ;
      next() ;
    } )
});

app.use((req,res,next) => {
  res.locals.csrfToken = req.csrfToken();
  res.locals.isLoggedIn = req.session.isLoggedIn || false ;
  res.locals.user = req.session.user || null ;
  next();
});

app.use(authRoutes);
// app.use( isAuth , namesRoutes );
// app.use( isAuth , titlesRoutes );
// app.use( isAuth , searchRoutes);
// app.use( isAuth , watchlistRoutes );
app.use( '/'  , titlesController.getHomePage ) ;

sequelize
  .authenticate()
  .then(() => {
    logger.info("Database connected successfully");
    // return sequelize.sync({ alter: false });
  })
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error(`Database connection failed: ${err.message}`);
    process.exit(1);
  });
