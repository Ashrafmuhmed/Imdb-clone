const Op = require("sequelize").Op;
const STATUS_CODE = require("../utils/status_code");
const models = require("../models");

const Titles = models.title;
const TitleRatings = models.title_ratings;
const TitleCrew = models.title_crew;
const TitleEpisode = models.title_episode;
const TitlePrincipals = models.title_principals;
const Names = models.names;
const Genre = models.genre;

exports.getHomePage = (req, res, next) => {
    Titles.findAll({
        limit: 12,
        include: [
            {
                model: TitleRatings,
                as: "rating",
                where: {
                    num_votes: {
                        [Op.gte]: 1000,
                    },
                },
            },
        ],
        order: [["rating", "average_rating", "DESC"]],
    }).then((data) => {
        return res.status(STATUS_CODE.OK).render("home/index", {
            title: data,
        });
    });
};

exports.getTitleDetails = (req, res, next) => {
    const titleId = req.params.id;

    Titles.findByPk(titleId, {
        include: [
            {
                model: Genre,
                as: "genres",
            },
            {
                model: Names,
                as: "principals",
            },
            {
                model: TitleCrew,
                as: "crew",
            },
            {
                model: TitleRatings,
                as: "rating",
            },
            {
                model: TitleEpisode,
                as: "episodes",
                order: [
                    ["season_number", "ASC"],
                    ["episode_number", "ASC"],
                ],
            },
        ],
    }).then((title) => {
        if (!title) {
            return next(new Error("Title is not found"));
        }

        // get directors and writters
        let directors = [],
            writters = [];
        if (title.crew) {
            if (title.crew.directors && Array.isArray(title.crew.directors)) {
                directors = title.crew.directors;
            }
            if (title.crew.writers && Array.isArray(title.crew.writers)) {
                writters = title.crew.writers;
            }
        }

        Names.findAll({
            where: {
                nconst: {[Op.in]: directors},
            },
        }).then((directorsDetails) => {
            directors = directorsDetails;
            Names.findAll({where: {nconst: {[Op.in]: writters}}}).then(
                (writtersDet) => {
                    writters = writtersDet;
                    res.status(STATUS_CODE.OK).render("titles/detail", {
                        title: title,
                        directors: directors,
                        writers: writters,
                        genres: title.genres || [],
                        episodes: title.episodes || [],
                        principals: title.principals || [],
                        rating: title.rating,
                    });
                }
            );
        });
    });
};

exports.getTitles = (req, res, next) => {
    const pg = req.query.pg ? +req.query.pg : 1;
    const itemsPerPage = 12;
    const offset = (pg - 1) * itemsPerPage;
    const type = req.query.type || "";
    const sort = req.query.sort || "";

    const whereClause = {};
    if (type) {
        whereClause.title_type = type;
    }
    let orderClause = [];
    let includeClause = [];

    if (sort == "newest") {
        orderClause = [["start_year", "DESC"]];
    } else if (sort == "oldest") {
        orderClause = [["start_year", "ASC"]];
    } else if (sort == "votes") {
        includeClause = [
            {
                model: TitleRatings,
                as: "rating",
                attributes: ["average_rating", "num_votes", "tconst"],
                where: {
                    num_votes: {
                        [Op.gte]: 1000,
                    },
                },
                required: true,
            },
        ];
        orderClause = [["rating", "num_votes", "DESC"]];
    } else {
        includeClause = [
            {
                model: TitleRatings,
                as: "rating",
                attributes: ["average_rating", "num_votes", "tconst"],
                where: {
                    num_votes: {
                        [Op.gte]: 1000,
                    },
                },
                required: true,
            },
        ];
        orderClause = [["rating", "average_rating", "DESC"]];
    }

    Titles.findAll({
        where: whereClause,
        attributes: ["tconst", "primary_title", "start_year", "title_type"],
        limit: itemsPerPage,
        offset: offset,
        include: includeClause,
        order: orderClause,
        subQuery: false,
        distinct: false,
        raw: true,
        nest: true,
    })
        .then((titles) => {
            Titles.count({where: whereClause}).then((count) => {
                const totalPages = Math.ceil(count / itemsPerPage);
                res.status(STATUS_CODE.OK).render("titles/list", {
                    titles: titles,
                    currentPage: pg,
                    total: count,
                    totalPages: totalPages,
                    type: type,
                    sort: sort,
                });
            });
        })
        .catch((err) => {
            next(err);
        });
};
