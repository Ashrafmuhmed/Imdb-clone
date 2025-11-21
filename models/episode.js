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
    tableName: "episodes",
    timestamps: false,
    indexes: [
      {
        fields: ["econst"],
      },
    ],
  }
);

module.exports = Episode;
