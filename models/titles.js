const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const Titles = sequelize.define(
  "titles",
  {
    tconst: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    Ttype: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    primaryTitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    OriginalTitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isAdult: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    startYear: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    endYear: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    runtimeMinutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    averageRating: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    numVotes: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "Titles",
    freezeTableName: true,
    timestamps: false,
    indexes: [
      { fields: ["primaryTitle"] },
      { fields: ["OriginalTitle"] },
      { fields: ["Ttype"] },
      { fields: ["primaryTitle", "Ttype"] },
    ],
  }
);

module.exports = Titles;
