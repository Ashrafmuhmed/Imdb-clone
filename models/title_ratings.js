const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('title_ratings', {
    tconst: {
      type: DataTypes.TEXT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'title',
        key: 'tconst'
      }
    },
    average_rating: {
      type: DataTypes.REAL,
      allowNull: true
    },
    num_votes: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'title_ratings',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "title_ratings_pkey",
        unique: true,
        fields: [
          { name: "tconst" },
        ]
      },
      {
        name: "title_ratings_avg_rating_idx",
        fields: [
          { name: "average_rating" },
        ]
      },
      {
        name: "title_ratings_num_votes_idx",
        fields: [
          { name: "num_votes" },
        ]
      },
    ]
  });
};
