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
      allowNull: false,
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
    tableName: "titles",
    timestamps: false,
    indexes: [
      {
        fields: ["tconst"],
      },
      {
        fields: ["primaryTitle"],
      },
      {
        fields: ["OriginalTitle"],
      },
    ],
  }
);

module.exports = Titles;
