const { Op, Sequelize } = require("sequelize");
const STATUS_CODE = require("../utils/status_code");
const models = require("../models");

const Titles = models.title;
const Names = models.names;
const Genres = models.genre;
const TitleRatings = models.title_ratings;
const sequelize = require("../utils/database");

// Cache for genres and title types
const cache = {
  genres: null,
  titleTypes: null,
};
const PAGINATION = {
  DEFAULT_PAGE: 1,
  LIMIT: 8,
  MIN_VOTES_THRESHOLD: 1000,
  MAX_GENRES: 3,
};

const SORT_OPTIONS = {
  RATING_DESC: "rating_desc",
  RATING_ASC: "rating_asc",
  YEAR_DESC: "year_desc",
  YEAR_ASC: "year_asc",
};

const parseQueryParams = (req) => {
  const titleType = Array.isArray(req.query.titleType)
    ? req.query.titleType[0]
    : req.query.titleType || null;
  const startYear = req.query.startYear
    ? parseInt(req.query.startYear, 10)
    : null;
  const endYear = req.query.endYear ? parseInt(req.query.endYear, 10) : null;
  const minRating = req.query.minRating
    ? parseFloat(req.query.minRating)
    : null;
  const maxRating = req.query.maxRating
    ? parseFloat(req.query.maxRating)
    : null;
  const genres = req.query.genre
    ? Array.isArray(req.query.genre)
      ? req.query.genre.filter(Boolean).slice(0, PAGINATION.MAX_GENRES)
      : [req.query.genre]
    : [];
  const sortBy = req.query.sortBy || SORT_OPTIONS.RATING_DESC;
  const page = Math.max(
    PAGINATION.DEFAULT_PAGE,
    parseInt(req.query.page, 10) || PAGINATION.DEFAULT_PAGE
  );

  return {
    titleType,
    startYear,
    endYear,
    minRating,
    maxRating,
    genres,
    sortBy,
    page,
    offset: (page - 1) * PAGINATION.LIMIT,
  };
};

const buildTitleWhereClause = ({ titleType, startYear, endYear }) => {
  const where = {};

  if (titleType) {
    where.title_type = titleType;
  }

  if (startYear !== null && endYear !== null) {
    where.start_year = { [Op.between]: [startYear, endYear] };
  } else if (startYear !== null) {
    where.start_year = { [Op.gte]: startYear };
  } else if (endYear !== null) {
    where.start_year = { [Op.lte]: endYear };
  }

  return where;
};

const buildRatingWhereClause = ({ minRating, maxRating }) => {
  const where = {};

  if (minRating !== null || maxRating !== null) {
    where.num_votes = { [Op.gte]: PAGINATION.MIN_VOTES_THRESHOLD };
  }

  if (minRating !== null) {
    where.average_rating = { [Op.gte]: minRating };
  }

  if (maxRating !== null) {
    where.average_rating = {
      ...(where.average_rating || {}),
      [Op.lte]: maxRating,
    };
  }

  return where;
};

const buildIncludeClause = (ratingWhere, genres, hasRatingFilter) => {
  const include = [
    {
      model: TitleRatings,
      as: "rating",
      attributes: ["average_rating", "num_votes"],
      required: hasRatingFilter,
      where: hasRatingFilter ? ratingWhere : undefined,
    },
  ];

  if (genres.length > 0) {
    include.push({
      model: Genres,
      as: "genres",
      attributes: [],
      through: { attributes: [] },
      where: { name: { [Op.in]: genres } },
      required: true,
    });
  }

  return include;
};

const buildOrderClause = (sortBy) => {
  switch (sortBy) {
    case SORT_OPTIONS.RATING_DESC:
      return [
        [Sequelize.literal('COALESCE("rating"."average_rating", 0)'), "DESC"],
        ["start_year", "DESC NULLS LAST"],
        ["tconst", "ASC"],
      ];
    case SORT_OPTIONS.RATING_ASC:
      return [
        [Sequelize.literal('COALESCE("rating"."average_rating", 0)'), "ASC"],
        ["start_year", "DESC NULLS LAST"],
        ["tconst", "ASC"],
      ];
    case SORT_OPTIONS.YEAR_DESC:
      return [
        ["start_year", "DESC NULLS LAST"],
        [Sequelize.literal('COALESCE("rating"."average_rating", 0)'), "DESC"],
        ["tconst", "ASC"],
      ];
    case SORT_OPTIONS.YEAR_ASC:
      return [
        ["start_year", "ASC NULLS LAST"],
        [Sequelize.literal('COALESCE("rating"."average_rating", 0)'), "DESC"],
        ["tconst", "ASC"],
      ];
    default:
      return [
        [Sequelize.literal('COALESCE("rating"."average_rating", 0)'), "DESC"],
        ["start_year", "DESC NULLS LAST"],
        ["tconst", "ASC"],
      ];
  }
};

const fetchGenresForTitles = (tconsts) => {
  if (!tconsts || tconsts.length === 0) {
    return Promise.resolve({});
  }

  return Titles.findAll({
    attributes: ["tconst"],
    where: { tconst: { [Op.in]: tconsts } },
    include: [
      {
        model: Genres,
        as: "genres",
        attributes: ["name"],
        through: { attributes: [] },
        required: false,
      },
    ],
  }).then((genreRows) => {
    return genreRows.reduce((map, t) => {
      const plain = t.get({ plain: true });
      map[plain.tconst] = (plain.genres || []).map((g) => ({ name: g.name }));
      return map;
    }, {});
  });
};

const getTitleResults = (params) => {
  const {
    titleType,
    startYear,
    endYear,
    minRating,
    maxRating,
    genres,
    sortBy,
    offset,
  } = params;

  const titleWhere = buildTitleWhereClause({ titleType, startYear, endYear });
  const ratingWhere = buildRatingWhereClause({ minRating, maxRating });
  const hasRatingFilter = minRating !== null || maxRating !== null;
  const hasGenreFilter = genres.length > 0;

  const includeClause = buildIncludeClause(
    ratingWhere,
    genres,
    hasRatingFilter
  );
  const orderClause = buildOrderClause(sortBy);

  return Titles.findAll({
    attributes: [
      "tconst",
      "title_type",
      "primary_title",
      "original_title",
      "start_year",
      "end_year",
      "runtime_minutes",
      "is_adult",
    ],
    where: titleWhere,
    include: includeClause,
    distinct: hasGenreFilter,
    order: orderClause,
    limit: PAGINATION.LIMIT + 1,
    offset,
    subQuery: false,
  }).then((rows) => {
    const hasMore = rows.length > PAGINATION.LIMIT;
    const slice = rows.slice(0, PAGINATION.LIMIT);

    const tconsts = slice.map((row) => {
      const plain = row.get({ plain: true });
      return plain.tconst;
    });

    return fetchGenresForTitles(tconsts).then((genreMap) => {
      const results = slice.map((row) => {
        const plain = row.get({ plain: true });
        return {
          ...plain,
          genres: genreMap[plain.tconst] || [],
          rating: plain.rating || null,
        };
      });

      return { rows: results, hasMore };
    });
  });
};

const getCachedGenres = () => {
  if (cache.genres) {
    return Promise.resolve(cache.genres);
  }

  return Genres.findAll({
    attributes: ["name"],
    order: [["name", "ASC"]],
    raw: true,
  }).then((genres) => {
    cache.genres = genres;
    return genres;
  });
};

const getCachedTitleTypes = () => {
  if (cache.titleTypes) {
    return Promise.resolve(cache.titleTypes);
  }

  return Titles.findAll({
    attributes: ["title_type"],
    where: { title_type: { [Op.ne]: null } },
    group: ["title_type"],
    order: [["title_type", "ASC"]],
    raw: true,
  }).then((titleTypes) => {
    cache.titleTypes = titleTypes;
    return titleTypes;
  });
};

const isYearRangeInvalid = (startYear, endYear) => {
  return startYear !== null && endYear !== null && startYear > endYear;
};

const buildFilters = (params, reqQuery) => {
  return {
    titleType: params.titleType || "",
    startYear: reqQuery.startYear || "",
    endYear: reqQuery.endYear || "",
    minRating: reqQuery.minRating || "",
    maxRating: reqQuery.maxRating || "",
    genres: params.genres || [],
    sortBy: params.sortBy || SORT_OPTIONS.RATING_DESC,
  };
};

const buildPagination = (page, hasMore) => {
  return {
    page,
    limit: PAGINATION.LIMIT,
    hasMore,
    hasNext: hasMore,
    hasPrev: page > PAGINATION.DEFAULT_PAGE,
  };
};

const renderEmptyResults = (res, params, reqQuery) => {
  return res.status(STATUS_CODE.OK).render("search/advanced", {
    titles: [],
    genres: [],
    titleTypes: [],
    filters: buildFilters(params, reqQuery),
    pagination: buildPagination(PAGINATION.DEFAULT_PAGE, false),
  });
};

exports.advancedSearch = (req, res, next) => {
  const params = parseQueryParams(req);

  if (isYearRangeInvalid(params.startYear, params.endYear)) {
    return renderEmptyResults(res, params, req.query);
  }

  Promise.all([
    getTitleResults(params),
    getCachedGenres(),
    getCachedTitleTypes(),
  ])
    .then(([titleResults, allGenres, allTitleTypes]) => {
      res.status(STATUS_CODE.OK).render("search/advanced", {
        titles: titleResults.rows,
        genres: allGenres.map((g) => g.name),
        titleTypes: allTitleTypes.map((t) => t.title_type).filter(Boolean),
        filters: buildFilters(params, req.query),
        pagination: buildPagination(params.page, titleResults.hasMore),
      });
    })
    .catch((err) => {
      console.error("advancedSearch error:", {
        message: err?.message,
        sql: err?.sql,
      });
      next(err);
    });
};

exports.search = (req, res, next) => {
  const query = (req.query.q || "").trim();
  const maxLimit = 100;

  if (!query) {
    return res.status(STATUS_CODE.OK).render("search/search", {
      query: "",
      titles: [],
      names: [],
      pagination: {
        page: 1,
        hasNext: false,
        hasPrev: false,
      },
    });
  }

  const escapedQuery = query.replace(/'/g, "''");

  const sqlQuery = `
  SET pg_trgm.similarity_threshold = 0.6;
  
  WITH q AS (
    SELECT 
      plainto_tsquery('simple', unaccent(?)) AS tsq,
      unaccent(?) AS uq
  )
  SELECT * FROM (
    SELECT 
      'title' AS type,
      t.tconst AS id,
      t.primary_title AS text,
      t.title_type,
      t.start_year,
      t.end_year,
      t.runtime_minutes,
      COALESCE(r.average_rating, 0) AS average_rating,
      COALESCE(r.num_votes, 0) AS num_votes,
      (
        ts_rank(t.search_vector, q.tsq) * 3
        + similarity(t.primary_title, q.uq) * 2
        + COALESCE(r.popularity_score, 0) * 1.5
      ) AS final_rank
    FROM "public"."title" t
    LEFT JOIN "public"."title_ratings" r ON r.tconst = t.tconst
    CROSS JOIN q
    WHERE t.search_vector @@ q.tsq OR t.primary_title % q.uq
    
    UNION ALL
    
    SELECT 
      'name' AS type,
      n.nconst AS id,
      n.primary_name AS text,
      NULL AS title_type,
      n.birth_year AS start_year,
      n.death_year AS end_year,
      NULL AS runtime_minutes,
      NULL AS average_rating,
      NULL AS num_votes,
      (
        ts_rank(n.search_vector, q.tsq) * 1
        + similarity(n.primary_name, q.uq) * 0.7
        + COALESCE(n.popularity_score, 0) * 0.5
      ) AS final_rank
    FROM "public"."names" n
    CROSS JOIN q
    WHERE n.search_vector @@ q.tsq OR n.primary_name % q.uq
  ) combined_results
  ORDER BY final_rank DESC
  LIMIT ?
`;
  const formatFallbackResults = (titleRows, nameRows) => {
    const results = [];

    titleRows.forEach((row) => {
      const plain = row.get({ plain: true });
      results.push({
        type: "title",
        id: plain.tconst,
        text: plain.primary_title,
        title_type: plain.title_type,
        start_year: plain.start_year,
        end_year: plain.end_year,
        runtime_minutes: plain.runtime_minutes,
        average_rating: plain.rating?.average_rating || 0,
        num_votes: plain.rating?.num_votes || 0,
      });
    });

    nameRows.forEach((row) => {
      const plain = row.get({ plain: true });
      results.push({
        type: "name",
        id: plain.nconst,
        text: plain.primary_name,
        title_type: null,
        start_year: plain.birth_year,
        end_year: plain.death_year,
        runtime_minutes: null,
        average_rating: null,
        num_votes: null,
      });
    });

    return results;
  };

  sequelize
    .query(sqlQuery, {
      replacements: [escapedQuery, escapedQuery, maxLimit], // Note: escapedQuery appears twice
      type: Sequelize.QueryTypes.SELECT,
    })
    .catch((sqlErr) => {
      console.error("Search SQL error, using Sequelize fallback:", {
        message: sqlErr?.message,
        parentMessage: sqlErr?.parent?.message,
        detail: sqlErr?.parent?.detail,
        code: sqlErr?.parent?.code,
      });

      return Promise.all([
        Titles.findAll({
          attributes: [
            "tconst",
            "primary_title",
            "title_type",
            "start_year",
            "end_year",
            "runtime_minutes",
          ],
          where: {
            primary_title: { [Op.iLike]: `%${query}%` },
          },
          include: [
            {
              model: TitleRatings,
              as: "rating",
              attributes: ["average_rating", "num_votes"],
              required: false,
            },
          ],
          limit: maxLimit,
          order: [
            ["start_year", "DESC NULLS LAST"],
            ["tconst", "ASC"],
          ],
          raw: false,
        }),
        Names.findAll({
          attributes: ["nconst", "primary_name", "birth_year", "death_year"],
          where: {
            primary_name: { [Op.iLike]: `%${query}%` },
          },
          limit: maxLimit,
          order: [["primary_name", "ASC"]],
          raw: false,
        }),
      ]).then(([titleRows, nameRows]) =>
        formatFallbackResults(titleRows, nameRows)
      );
    })
    .then((results) => {
      const validResults = Array.isArray(results) ? results : [];
      const mixedResults = [];
      const titleIndexMap = new Map();

      validResults.forEach((row, index) => {
        if (row.type === "title") {
          const resultItem = {
            type: "title",
            tconst: row.id,
            id: row.id,
            primaryTitle: row.text,
            title_type: row.title_type,
            startYear: row.start_year,
            endYear: row.end_year,
            runtimeMinutes: row.runtime_minutes,
            averageRating: row.average_rating || 0,
            numVotes: row.num_votes || 0,
            genres: [],
          };
          titleIndexMap.set(row.id, index);
          mixedResults.push(resultItem);
        } else if (row.type === "name") {
          mixedResults.push({
            type: "name",
            nconst: row.id,
            id: row.id,
            name: row.text,
            birthYear: row.start_year,
            deathYear: row.end_year,
            popularityScore: row.popularity_score || 0,
          });
        }
      });

      if (titleIndexMap.size === 0) {
        return Promise.resolve(mixedResults);
      }

      const tconsts = Array.from(titleIndexMap.keys());
      return fetchGenresForTitles(tconsts).then((genreMap) => {
        titleIndexMap.forEach((index, tconst) => {
          mixedResults[index].genres = genreMap[tconst] || [];
        });
        return mixedResults;
      });
    })
    .then((mixedResults) => {
      res.status(STATUS_CODE.OK).render("search/search", {
        query: query,
        results: mixedResults,
        pagination: {
          page: 1,
          hasNext: false,
          hasPrev: false,
          nextPage: null,
          prevPage: null,
        },
      });
    })
    .catch((err) => {
      next(err);
    });
};
