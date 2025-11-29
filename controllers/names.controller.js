const { Op } = require("sequelize");
const Names = require("../models/names");
const Profession = require("../models/profession");
const Titles = require("../models/titles");
const profession = require("../models/profession");
const STATUS_CODE = require("../utils/status_code");


exports.getNames = (req, res, next) => {
  const pg = req.query.pg ? +req.query.pg : 1;
  const limit = 20;
  const offset = (pg - 1) * limit;

  Names.findAndCountAll({ limit, offset })
    .then((result) => {
      const totalPages = Math.ceil(result.count / limit);
      res.status(STATUS_CODE.OK).render("names/list", {
        names: result.rows,
        total: result.count,
        currentPage: pg,
        totalPages: totalPages,
        perPage: limit,
        isLoggedIn: req.session.isLoggedIn || false,
        user: req.session.user || null,
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getName = (req, res, next) => {
  const nameId = req.params.id;
  Names.findByPk(nameId, {
    include: [
      { model: Profession },
      {
        model: Titles,
        as: "writtenTitles",
        attributes: ["tconst", "primaryTitle", "averageRating"],
      },
      {
        model: Titles,
        as: "directedTitles",
        attributes: ["tconst", "primaryTitle", "averageRating"],
      },
    ],
  }).then((name) => {
    if (!name) {
      return next(new Error("Name not found"));
    }

    let knowFor = [];

    if (name.knownFor) {
      const knownForIds = name.knownFor.split(",").filter((id) => id.trim());
      if (knownForIds.length > 0) {
        return Titles.findAll({
          where: {
            tconst: {
              [Op.in]: knownForIds,
            },
          },
        }).then((knownForTitles) => {
          res.status(STATUS_CODE.OK).render("names/detail", {
            name: name,
            professions: name.professions || [],
            knownFor: knownForTitles || [],
            writtenTitles: name.writtenTitles || [],
            directedTitles: name.directedTitles || [],
            isLoggedIn: req.session.isLoggedIn || false,
            user: req.session.user || null,
          });
        });
      }
    } else {
      res.status(STATUS_CODE.OK).render("names/detail", {
        name: name,
        professions: name.professions || [],
        knownFor: [],
        writtenTitles: name.writtenTitles || [],
        directedTitles: name.directedTitles || [],
        isLoggedIn: req.session.isLoggedIn || false,
        user: req.session.user || null,
      });
    }
  });
};

exports.getNameKnownFor = (req, res, next) => {
  const nameId = req.params.id;

  Names.findByPk(nameId)
    .then((name) => {
      const knownForIds = name.knownFor.split(",");
      return knownForIds;
    })
    .then((knownForIds) => {
      Titles.findAll({
        where: {
          tconst: {
            [Op.in]: knownForIds,
          },
        },
        attributes: ["primaryTitle", "averageRating", "runtimeMinutes"],
      }).then((titles) => {
        res.json(titles);
      });
    });
};

exports.getNameProfessions = (req, res, next) => {
  const namesId = req.params.id;

  Names.findByPk(namesId, {
    include: {
      model: Profession,
    },
  }).then((name) => {
    console.log(name);
    res.json(name.professions);
  });
};
