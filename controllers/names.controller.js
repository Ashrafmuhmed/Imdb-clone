const { Op } = require("sequelize");
const STATUS_CODE = require("../utils/status_code");
const models = require("../models");

const Names = models.names;
const Title = models.title;
const TitleCrew = models.title_crew;
const TitleRatings = models.title_ratings;
const TitlePrincipals = models.title_principals;

exports.getNames = (req, res, next) => {
  const pg = req.query.pg ? +req.query.pg : 1;
  const limit = 12;
  const offset = (pg - 1) * limit;

  Names.count()
    .then((cnt) => {
      Names.findAll({
        limit,
        offset,
        order: [["popularity_score", "DESC"]],
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

      const principalTitlesPromise = TitlePrincipals.findAll({
        where: { nconst: nameId },
        attributes: ["tconst", "category", "job", "characters", "ordering"],
        include: [
          {
            model: Title,
            as: "title",
            attributes: ["tconst", "primary_title", "start_year", "title_type"],
            include: [
              {
                model: TitleRatings,
                as: "rating",
                required: false,
              },
            ],
            required: false,
          },
        ],
        order: [["tconst", "ASC"], ["ordering", "ASC"]],
        subQuery: false,
      });

      return Promise.all([knownForPromise, crewTitlesPromise, principalTitlesPromise]).then(
        ([knownFor, crewTitles, principalTitles]) => {
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

          const deduplicatedPrincipals = [];
          const seenTconsts = new Set();
          
          principalTitles.forEach((principal) => {
            if (principal.title && !seenTconsts.has(principal.title.tconst)) {
              seenTconsts.add(principal.title.tconst);
              deduplicatedPrincipals.push(principal);
            }
          });

          const showAll = req.query.showAll === 'true';
          const limit = 8;
          
          const limitedKnownFor = showAll ? (knownFor || []) : (knownFor || []).slice(0, limit);
          const limitedWrittenTitles = showAll ? writtenTitles : writtenTitles.slice(0, limit);
          const limitedDirectedTitles = showAll ? directedTitles : directedTitles.slice(0, limit);
          const limitedPrincipalTitles = deduplicatedPrincipals;

          res.status(STATUS_CODE.OK).render("names/detail", {
            name: name,
            professions: name.primary_profession || [],
            knownFor: limitedKnownFor,
            writtenTitles: limitedWrittenTitles,
            directedTitles: limitedDirectedTitles,
            principalTitles: limitedPrincipalTitles,
            allKnownFor: knownFor || [],
            allWrittenTitles: writtenTitles || [],
            allDirectedTitles: directedTitles || [],
            allPrincipalTitles: deduplicatedPrincipals || [],
            showAll: showAll,
            hasMoreKnownFor: (knownFor || []).length > limit,
            hasMoreWrittenTitles: writtenTitles.length > limit,
            hasMoreDirectedTitles: directedTitles.length > limit,
            hasMorePrincipalTitles: false,
          });
        }
      );
    })
    .catch((err) => next(err));
};
