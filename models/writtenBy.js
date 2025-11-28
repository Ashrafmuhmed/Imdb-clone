const sequelize = require("../utils/database");
const { DataTypes } = require("sequelize");

const WrittenBy = sequelize.define(
  "writtenby",
  {
    tconst: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    nconst: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
  },
  {
    tableName: "WrittenBy",
    timestamps: false,
    indexes: [{ fields: ["tconst"] }, { fields: ["nconst"] }],
  }
);

module.exports = WrittenBy;
