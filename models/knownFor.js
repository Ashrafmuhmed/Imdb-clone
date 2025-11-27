const sequelize = require("../utils/database");
const { DataTypes } = require("sequelize");

const KnownFor = sequelize.define(
  "KnownFor",
  {
    nconst: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    knownFor: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
  },
  {
    tableName: "KnownFor",
    freezeTableName: true,
    timestamps: false,
    indexes: [{ fields: ["nconst"] }, { fields: ["knownFor"] }],
  }
);

module.exports = KnownFor;
