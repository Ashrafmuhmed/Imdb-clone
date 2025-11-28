const sequelize = require("../utils/database");
const { DataTypes } = require("sequelize");

const profession = sequelize.define(
  "profession",
  {
    nconst: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    profession: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
  },
  {
    tableName: "Profession",
    timestamps: false,
    indexes: [{ fields: ["nconst"] }, { fields: ["profession"] }],
  }
);
module.exports = profession;