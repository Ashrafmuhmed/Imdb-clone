const Names = require("./names");
const Titles = require("./titles");
const Episode = require("./episode");
const User = require("./user");
const Watchlist = require("./watchlist");
const DirectedBy = require("./directedBy");
const WrittenBy = require("./writtenBy");
const Genres = require("./genres");
const Profession = require("./profession");

function defineAssociations() {
  // Names <-> Titles - done
  Names.belongsToMany(Titles, {
    through: DirectedBy,
    foreignKey: "nconst",
    otherKey: "tconst",
    as: "directedTitles",
  });
  Titles.belongsToMany(Names, {
    through: DirectedBy,
    foreignKey: "tconst",
    otherKey: "nconst",
    as: "directors",
  });

  // Names <-> Titles - done
  Names.belongsToMany(Titles, {
    through: WrittenBy,
    foreignKey: "nconst",
    otherKey: "tconst",
    as: "writtenTitles",
  });
  Titles.belongsToMany(Names, {
    through: WrittenBy,
    foreignKey: "tconst",
    otherKey: "nconst",
    as: "writers",
  });

  // Titles <-> Episode - done
  Titles.hasMany(Episode, {
    foreignKey: "tconst",
    onDelete: "CASCADE",
  });
  Episode.belongsTo(Titles, {
    foreignKey: "tconst",
  });

  // User <-> Titles - done
  User.belongsToMany(Titles, {
    through: Watchlist,
    foreignKey: "userId",
    otherKey: "tconst",
  });
  Titles.belongsToMany(User, {
    through: Watchlist,
    foreignKey: "tconst",
    otherKey: "userId",
  });

  // Titles <-> Genres - done
  Titles.hasMany(Genres, {
    foreignKey: "tconst",
    onDelete: "CASCADE",
  });
  Genres.belongsTo(Titles, {
    foreignKey: "tconst",
  });

  // Names <-> Profession - done
  Names.hasMany(Profession, {
    foreignKey: "nconst",
    onDelete: "CASCADE",
  });
  Profession.belongsTo(Names, {
    foreignKey: "nconst",
  });

}

module.exports = defineAssociations;
