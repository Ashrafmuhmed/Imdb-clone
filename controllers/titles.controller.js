const Titles = require("../models/titles");
const Op = require("sequelize").Op;
const STATUS_CODE = require("../utils/status_code");
const Names = require("../models/names");
const Episode = require("../models/episode");
const Principals = require("../models/principals");
const Profession = require("../models/profession");
const Genres = require("../models/genres");

exports.getHomePage = (req, res, next) => {
  Titles.findAll({
    limit: 10,
    order: [["averageRating", "DESC"]],
    where: {
      numVotes: {
        [Op.gte]: 1000,
      },
    },
  })
    .then((titles) => {
      res.status(STATUS_CODE.OK).render("home/index", {
        title: titles,
        user: req.session.user || null,
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getTitleDetails = (req, res, next) => {
  const titleId = req.params.id;

  Titles.findByPk(titleId, {
    include: [
      { model: Names, as: "directors" },
      { model: Names, as: "writers" },
      { model: Genres },
      {
        model: Episode,
        attributes: ["econst", "tconst", "seasonNumber", "episodeNumber"],
        order: [
          ["seasonNumber", "ASC"],
          ["episodeNumber", "ASC"],
        ],
      },
      {
        model: Principals,
        attributes: [
          "tconst",
          "ordering",
          "nconst",
          "category",
          "job",
          "characters",
        ],
        include: [
          {
            model: Names,
            attributes: ["nconst", "name", "birthYear", "deathYear"],
            include: [
              {
                model: Profession,
                attributes: ["profession"],
              },
            ],
          },
        ],
        order: [["ordering", "ASC"]],
      },
    ],
  })
    .then((title) => {
        console.log(titleId);
      if (!title) {
        return next(new Error("Title not found"));
      }
      res.status(STATUS_CODE.OK).render("titles/detail", {
        title: title,
        directors: title.directors,
        writers: title.writers,
        genres: title.genres,
        episodes: title.episodes,
        principals: title.principals,
        user: req.session.user || null,
      });
    })
    .catch((err) => {
      next(err);
    });
};
