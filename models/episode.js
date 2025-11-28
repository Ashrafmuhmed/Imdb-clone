const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const Episode = sequelize.define(
  "episode",
  {
    econst: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    tconst: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    seasonNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    episodeNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "Episodes",
    freezeTableName: true,
    timestamps: false,
    indexes: [{ fields: ["tconst"] }, { fields: ["seasonNumber"] }],
  }
);

module.exports = Episode;
