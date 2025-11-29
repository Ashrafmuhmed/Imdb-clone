const { Op } = require("sequelize");
const Titles = require("../models/titles");
const Names = require("../models/names");
const Genres = require("../models/genres");
const STATUS_CODE = require("../utils/status_code");

exports.search = (req, res, next) => {
  const query = req.query.q || "";
  const searchTerm = query.trim();
  const type = req.query.type || "";
  const year = req.query.year || "";
  const genre = req.query.genre || "";

  const titleWhere = {};

  if (searchTerm) {
    titleWhere[Op.or] = [
      { primaryTitle: { [Op.iLike]: `%${searchTerm}%` } },
      { OriginalTitle: { [Op.iLike]: `%${searchTerm}%` } },
    ];
  }

  if (type) {
    titleWhere.Ttype = type;
  }

  if (year) {
    titleWhere.startYear = +year;
  }

  Genres.findAll({
    attributes: ["genres"],
    group: ["genres"],
    order: [["genres", "ASC"]],
  })
    .then((allGenres) => {
      const uniqueGenres = allGenres.map((g) => g.genres);

      let titleQuery = Titles.findAll({
        where: titleWhere,
        limit: 50,
        order: [["averageRating", "DESC"]],
        include: genre
          ? [
              {
                model: Genres,
                attributes: ["genres"],
                where: { genres: genre },
              },
            ]
          : [
              {
                model: Genres,
                attributes: ["genres"],
              },
            ],
      });

      const nameQuery = searchTerm
        ? Names.findAll({
            where: {
              name: { [Op.iLike]: `%${searchTerm}%` },
            },
            limit: 20,
            order: [["name", "ASC"]],
          })
        : Promise.resolve([]);

      return Promise.all([titleQuery, nameQuery, uniqueGenres]);
    })
    .then(([titles, names, genres]) => {
      res.status(STATUS_CODE.OK).render("search/results", {
        query: searchTerm,
        titles: titles || [],
        names: names || [],
        genres: genres || [],
        filters: {
          type: type,
          year: year,
          genre: genre,
        },
      });
    })
    .catch((err) => {
      next(err);
    });
};
