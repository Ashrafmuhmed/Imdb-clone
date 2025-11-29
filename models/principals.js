const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const Principals = sequelize.define(
  "principals",
  {
    tconst: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    ordering: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    nconst: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    job: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    characters: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "Principals",
    freezeTableName: true,
    timestamps: false,
    indexes: [
      { fields: ["tconst"] },
      { fields: ["nconst"] },
      { fields: ["category"] },
      { fields: ["tconst", "ordering"] },
    ],
  }
);

module.exports = Principals;

