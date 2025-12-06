const STATUS_CODE = require("../utils/status_code");
const models = require("../models");

const Titles = models.title;
const TitleRatings = models.title_ratings;
const TitleCrew = models.title_crew;
const TitleEpisode = models.title_episode;
const TitlePrincipals = models.title_principals;
const Names = models.names;
const Genre = models.genre;
const User = models.user;

exports.getWatchlist = (req, res, next) => {
  const userId = req.session.user.userId;
  User.findByPk(userId, {
    include: {
      model: Titles,
      as: "watchlistTitles",
      attributes: [
        "tconst",
        "title_type",
        "primary_title",
        "start_year",
        "runtime_minutes",
      ],
      include: {
        model: TitleRatings,
        as: "rating",
      },
    },
    attributes: [],
  }).then((user) => {
    // res.json(user);
    res.status(STATUS_CODE.OK).render("watchlist/index", {
      watchlist: user.watchlistTitles || [],
    });
  });
};

exports.addToWatchlist = (req, res, next) => {
  const userId = req.session.user.userId;
  const titleId = req.body.tconst;

  User.findByPk(userId).then((user) => {
    Titles.findByPk(titleId).then((title) => {
      user.addWatchlistTitles(title);
      res.redirect("/watchlist");
    });
  });
};

exports.removeFromWatchlist = (req, res, next) => {
  const { tconst } = req.body;

  User.findByPk(req.session.user.userId)
    .then((user) => {
      Titles.findByPk(tconst).then((title) => {
        user.removeWatchlistTitles(title);
        res.redirect("/watchlist");
      });
    })
    .catch((err) => {
      next(err);
    });
};
