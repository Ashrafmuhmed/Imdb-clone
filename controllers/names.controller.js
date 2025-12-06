const { Op } = require("sequelize");
const STATUS_CODE = require("../utils/status_code");
const models = require("../models");

const Names = models.names;
const Title = models.title;
const TitleCrew = models.title_crew;
const TitleRatings = models.title_ratings;

exports.getNames = (req, res, next) => {
  const pg = req.query.pg ? +req.query.pg : 1;
  const limit = 20;
  const offset = (pg - 1) * limit;

  Names.count()
    .then((cnt) => {
      Names.findAll({
        limit,
        offset,
        attributes: ["nconst", "primary_name", "birth_year", "death_year"],
      }).then((names) => {
        // res.json(names);
        const totalPgs = Math.ceil(cnt / limit);
        res.status(STATUS_CODE.OK).render("names/list", {
          names: names,
          total: cnt,
          currentPage: pg,
          totalPages: totalPgs,
          perPage: limit,
        });
      });
    })
    .catch((err) => next(err));
};

exports.getName = (req, res, next) => {
  const nameId = req.params.id;
  Names.findByPk(nameId)
    .then((name) => {
      if (!name) {
        return next(new Error("Name not found"));
      }

      // Get known for titles if they exist
      const knownForPromise =
        name.known_for_titles &&
        Array.isArray(name.known_for_titles) &&
        name.known_for_titles.length > 0
          ? Title.findAll({
              where: {
                tconst: {
                  [Op.in]: name.known_for_titles,
                },
              },
              include: [
                {
                  model: TitleRatings,
                  as: "rating",
                  required: false,
                },
              ],
            })
          : Promise.resolve([]);

      // Get titles where this person is director or writer
      const crewTitlesPromise = TitleCrew.findAll({
        where: {
          [Op.or]: [
            { directors: { [Op.contains]: [nameId] } },
            { writers: { [Op.contains]: [nameId] } },
          ],
        },
        include: [
          {
            model: Title,
            as: "title",
            attributes: [ 'primary_title' , 'start_year' , 'tconst' ] ,
            include: [
              {
                model: TitleRatings,
                as: "rating",
                required: false,
              },
            ],
          },
        ],
      });

      return Promise.all([knownForPromise, crewTitlesPromise]).then(
        ([knownFor, crewTitles]) => {
          const directedTitles = crewTitles
            .filter(
              (ct) =>
                ct.directors &&
                Array.isArray(ct.directors) &&
                ct.directors.includes(nameId)
            )
            .map((ct) => ct.title)
            .filter((t) => t);
          const writtenTitles = crewTitles
            .filter(
              (ct) =>
                ct.writers &&
                Array.isArray(ct.writers) &&
                ct.writers.includes(nameId)
            )
            .map((ct) => ct.title)
            .filter((t) => t);

          // res.json({ writtenTitles, directedTitles });

          res.status(STATUS_CODE.OK).render("names/detail", {
            name: name,
            professions: name.primary_profession || [],
            knownFor: knownFor || [],
            writtenTitles: writtenTitles || [],
            directedTitles: directedTitles || [],
          });
        }
      );
    })
    .catch((err) => next(err));
};
