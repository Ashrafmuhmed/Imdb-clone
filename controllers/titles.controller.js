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
    limit: 12,
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

exports.getTitles = (req, res, next) => {
  const pg = req.query.pg ? +req.query.pg : 1;
  const itemsPerPage = 12;
  const offset = (pg - 1) * itemsPerPage;
  const type = req.query.type || "";
  const sort = req.query.sort || "rating";

  const whereClause = {};
  if (type) {
    whereClause.Ttype = type;
  }
  let orderClause = [];

  if (sort == "newest") {
    orderClause = [["startYear", "DESC"]];
  } else if (sort == "oldest") {
    orderClause = [["startYear", "ASC"]];
  } else if (sort == "votes") {
    orderClause = [["numVotes", "DESC"]];
  } else {
    orderClause = [["averageRating", "DESC"]];
  }

  Titles.findAndCountAll({
    where: whereClause,
    limit: itemsPerPage,
    offset: offset,
    order: orderClause,
  })
    .then((result) => {
      const totalPages = Math.ceil(result.count / itemsPerPage);
      res.status(STATUS_CODE.OK).render("titles/list", {
        titles: result.rows,
        currentPage: pg,
        total: result.count,
        totalPages: totalPages,
        type: type,
        sort: sort,
        user: req.session.user || null,
      });
    })
    .catch((err) => {
      next(err);
    });
};
