const { Op } = require("sequelize");
const Names = require("../models/names");
const Profession = require("../models/profession");
const Titles = require("../models/titles");

exports.getNames = (req, res, next) => {
  const pg = req.query.pg ? +req.query.pg : 1;
  const limit = 10;
  const offset = (pg - 1) * limit;

  Names.findAndCountAll({ limit, offset })
    .then((result) => {
      res.json({
        names: result.rows,
        total: result.count,
        page: pg,
        perPage: limit,
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
  })
    .then((name) => {
      if (!name) {
        return res.status(404).json({ message: "Name not found" });
      }
      res.json({
        name: name,
      });
    })
    .catch((err) => {
      next(err);
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
