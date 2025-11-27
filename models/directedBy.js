const sequelize = require("../utils/database");
const { DataTypes } = require("sequelize");

const DirectedBy = sequelize.define(
  "DirectedBy",
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
    tableName: "DirectedBy",
    timestamps: false,
    indexes: [{ fields: ["tconst"] }, { fields: ["nconst"] }],
  }
);

module.exports = DirectedBy;