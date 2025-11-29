const User = require("../models/user");
const Titles = require("../models/titles");
const STATUS_CODE = require("../utils/status_code");
const Watchlist = require("../models/watchlist");

exports.getWatchlist = (req, res, next) => {
  const userId = req.session.user.userId;
  User.findByPk(userId, {
    include: {
      model: Titles,
    },
  }).then((user) => {
    res.status(STATUS_CODE.OK).render("watchlist/index", {
      watchlist: user.titles || [],
    });
  });
};

exports.addToWatchlist = (req, res, next) => {
  const userId = req.session.user.userId;
  const titleId = req.body.tconst;

  User.findByPk(userId).then((user) => {
    return user.addTitle(titleId).then(() => {
      res.redirect("/watchlist");
    });
  });
};

exports.removeFromWatchlist = (req, res, next) => {
  if (!req.session.user) {
    return res.status(STATUS_CODE.UNAUTHORIZED).json({
      message: "Please login",
    });
  }

  const { tconst } = req.body;

  User.findByPk(req.session.user.userId)
    .then((user) => {
      return user.removeTitle(tconst).then(() => {
        res.redirect("/watchlist");
      });
    })
    .catch((err) => {
      next(err);
    });
};

