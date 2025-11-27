const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const Watchlist = sequelize.define(
  "watchlist",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "userId",
      },
      onDelete: "CASCADE",
    },
    tconst: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "Titles",
        key: "tconst",
      },
      onDelete: "CASCADE",
    },
    DateAdded: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    Status: {
      type: DataTypes.STRING,
      defaultValue: "Plan to Watch",
    },
    isFavorite: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    progress: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    }
  },
  {
    tableName: "WatchList",
    freezeTableName: true,
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["userId", "tconst"], 
      },
      {
        fields: ["userId"],
      },
      {
        fields: ["tconst"],
      },
    ],
  }
);

module.exports = Watchlist;
