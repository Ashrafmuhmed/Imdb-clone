const Op = require("sequelize").Op;
const STATUS_CODE = require("../utils/status_code");
const models = require("../models");
const sequelize = require("../utils/database");

const Titles = models.title;
const TitleRatings = models.title_ratings;
const TitleCrew = models.title_crew;
const TitleEpisode = models.title_episode;
const TitlePrincipals = models.title_principals;
const Names = models.names;
const Genre = models.genre;

// Helper function to fetch data from materialized views
const fetchMaterializedView = (viewName, limit = 8) => {
    const query = `
        SELECT * FROM ${viewName}
        LIMIT :limit
    `;
    return sequelize.query(query, {
        replacements: { limit },
        type: sequelize.QueryTypes.SELECT
    })
        .then((data) => data)
        .catch((error) => {
            console.error(`Error fetching from ${viewName}:`, error);
            return [];
        });
};

exports.getHomePage = (req, res, next) => {
    Promise.all([
        fetchMaterializedView('mv_top_250_movies', 8),
        fetchMaterializedView('mv_top_250_series', 8),
        fetchMaterializedView('mv_top_250_episodes', 8)
    ])
        .then(([topMovies, topSeries, topEpisodes]) => {
            return res.status(STATUS_CODE.OK).render("home/index", {
                topMovies: topMovies,
                topSeries: topSeries,
                topEpisodes: topEpisodes,
            });
        })
        .catch((error) => {
            next(error);
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
                through: {
                    attributes: ["job", "characters", "category", "ordering"]
                },
                attributes: ["nconst", "primary_name"],
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
                separate: true,
                order: [
                    ["season_number", "ASC"],
                    ["episode_number", "ASC"],
                ],
                include: [
                    {
                        model: Titles,
                        as : "episode_title"
                    }
                ],  

            },
            {
                model: TitleEpisode,
                as: "episode_info",
                attributes: ["parent_tconst"],
                required: false,
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
                    
                    const showAll = req.query.showAll === 'true';
                    const limit = 8;
                    console.log(title.episodes[0]);
                    const limitedDirectors = showAll ? directors : directors.slice(0, limit);
                    const limitedWriters = showAll ? writters : writters.slice(0, limit);
                    const limitedPrincipals = showAll ? (title.principals || []) : (title.principals || []).slice(0, limit);
                    res.status(STATUS_CODE.OK).render("titles/detail", {
                        title: title,
                        directors: limitedDirectors,
                        writers: limitedWriters,
                        allDirectors: directors,
                        allWriters: writters,
                        genres: title.genres || [],
                        episodes: title.episodes || [],
                        principals: limitedPrincipals,
                        allPrincipals: title.principals || [],
                        rating: title.rating,
                        showAll: showAll,
                        hasMoreDirectors: directors.length > limit,
                        hasMoreWriters: writters.length > limit,
                        hasMorePrincipals: (title.principals || []).length > limit,
                        parentTconst: title.episode_info.parent_tconst || null,
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
exports.getTop250Movies = (req, res, next) => {
    const pg = req.query.pg ? +req.query.pg : 1;
    const itemsPerPage = 20;
    const offset = (pg - 1) * itemsPerPage;

    const dataQuery = `
        SELECT * FROM mv_top_250_movies
        LIMIT :limit OFFSET :offset
    `;
    
    const countQuery = `
        SELECT COUNT(*) as total FROM mv_top_250_movies
    `;

    Promise.all([
        sequelize.query(dataQuery, {
            replacements: { limit: itemsPerPage, offset: offset },
            type: sequelize.QueryTypes.SELECT
        }),
        sequelize.query(countQuery, {
            type: sequelize.QueryTypes.SELECT
        })
    ])
        .then(([data, countResult]) => {
            const total = parseInt(countResult[0].total);
            const totalPages = Math.ceil(total / itemsPerPage);

            return res.status(STATUS_CODE.OK).render("titles/materialized-list", {
                titles: data,
                currentPage: pg,
                total: total,
                totalPages: totalPages,
                viewName: "Top 250 Movies",
                viewType: "movies"
            });
        })
        .catch((error) => {
            next(error);
        });
};

exports.getTop250Series = (req, res, next) => {
    const pg = req.query.pg ? +req.query.pg : 1;
    const itemsPerPage = 20;
    const offset = (pg - 1) * itemsPerPage;

    const dataQuery = `
        SELECT * FROM mv_top_250_series
        LIMIT :limit OFFSET :offset
    `;
    
    const countQuery = `
        SELECT COUNT(*) as total FROM mv_top_250_series
    `;

    Promise.all([
        sequelize.query(dataQuery, {
            replacements: { limit: itemsPerPage, offset: offset },
            type: sequelize.QueryTypes.SELECT
        }),
        sequelize.query(countQuery, {
            type: sequelize.QueryTypes.SELECT
        })
    ])
        .then(([data, countResult]) => {
            const total = parseInt(countResult[0].total);
            const totalPages = Math.ceil(total / itemsPerPage);

            return res.status(STATUS_CODE.OK).render("titles/materialized-list", {
                titles: data,
                currentPage: pg,
                total: total,
                totalPages: totalPages,
                viewName: "Top 250 Series",
                viewType: "series"
            });
        })
        .catch((error) => {
            next(error);
        });
};

exports.getTopEpisodes = (req, res, next) => {
    const pg = req.query.pg ? +req.query.pg : 1;
    const itemsPerPage = 20;
    const offset = (pg - 1) * itemsPerPage;

    const dataQuery = `
        SELECT * FROM mv_top_250_episodes
        LIMIT :limit OFFSET :offset
    `;
    
    const countQuery = `
        SELECT COUNT(*) as total FROM mv_top_250_episodes
    `;

    Promise.all([
        sequelize.query(dataQuery, {
            replacements: { limit: itemsPerPage, offset: offset },
            type: sequelize.QueryTypes.SELECT
        }),
        sequelize.query(countQuery, {
            type: sequelize.QueryTypes.SELECT
        })
    ])
        .then(([data, countResult]) => {
            const total = parseInt(countResult[0].total);
            const totalPages = Math.ceil(total / itemsPerPage);

            return res.status(STATUS_CODE.OK).render("titles/materialized-list", {
                titles: data,
                currentPage: pg,
                total: total,
                totalPages: totalPages,
                viewName: "Top Episodes",
                viewType: "episodes"
            });
        })
        .catch((error) => {
            next(error);
        });
};