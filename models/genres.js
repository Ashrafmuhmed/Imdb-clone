const sequelize = require("../utils/database");
const { DataTypes } = require("sequelize");

const Genres = sequelize.define(
  "genres",
  {
    tconst: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    genres: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
  },
  {
    tableName: "Genres",
    timestamps: false,
    indexes: [{ fields: ["tconst"] }],
  }
);

module.exports = Genres;