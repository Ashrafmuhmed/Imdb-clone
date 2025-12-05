const DataTypes = require("sequelize").DataTypes;
const _genre = require("./genre");
const _names = require("./names");
const _title = require("./title");
const _title_crew = require("./title_crew");
const _title_episode = require("./title_episode");
const _title_genre = require("./title_genre");
const _title_principals = require("./title_principals");
const _title_ratings = require("./title_ratings");
const _user = require("./user");
const _watchlist = require("./watchlist");

function initModels(sequelize) {
    const genre = _genre(sequelize, DataTypes);
    const names = _names(sequelize, DataTypes);
    const title = _title(sequelize, DataTypes);
    const title_crew = _title_crew(sequelize, DataTypes);
    const title_episode = _title_episode(sequelize, DataTypes);
    const title_genre = _title_genre(sequelize, DataTypes);
    const title_principals = _title_principals(sequelize, DataTypes);
    const title_ratings = _title_ratings(sequelize, DataTypes);
    const user = _user(sequelize, DataTypes);
    const watchlist = _watchlist(sequelize, DataTypes);

    // Title - Genre M-N
    title.belongsToMany(genre, {
        as: "genres",
        through: title_genre,
        foreignKey: "tconst",
        otherKey: "genre_id",
    });
    genre.belongsToMany(title, {
        as: "titles",
        through: title_genre,
        foreignKey: "genre_id",
        otherKey: "tconst",
    });


    // Title - Names N-M
    title.belongsToMany(names, {
        as: "principals",
        through: title_principals,
        foreignKey: "tconst",
        otherKey: "nconst",
    });
    names.belongsToMany(title, {
        as: "titles",
        through: title_principals,
        foreignKey: "nconst",
        otherKey: "tconst",
    });


    // Title - Title Crew 1-1
    title.hasOne(title_crew, {
        as: "crew", 
        foreignKey: "tconst"});
    title_crew.belongsTo(title, {as: "title", foreignKey: "tconst"});

    // Title - Title Ratings 1-1
    title.hasOne(title_ratings, {as: "rating", foreignKey: "tconst"});
    title_ratings.belongsTo(title, {as: "title", foreignKey: "tconst"});

    // Title - Title Episode (Self-referential for TV series)
    title.hasMany(title_episode, {
        as: "episodes",
        foreignKey: "parent_tconst",
    });
    title_episode.belongsTo(title, {
        as: "parent_title",
        foreignKey: "parent_tconst",
    });

    title.hasOne(title_episode, {
        as: "episode_info",
        foreignKey: "tconst",
    });
    title_episode.belongsTo(title, {
        as: "episode_title",
        foreignKey: "tconst",
    });

    // User - Title N-M
    user.belongsToMany(title, {
        as: "watchlistTitles",
        through: watchlist,
        foreignKey: "user_id",
        otherKey: "tconst",
    });

    title.belongsToMany(user, {
        as: "watchlistUsers",
        through: watchlist,
        foreignKey: "tconst",
        otherKey: "user_id",
    });


    return {
        genre,
        names,
        title,
        title_crew,
        title_episode,
        title_genre,
        title_principals,
        title_ratings,
        user,
        watchlist,
    };
}

module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
