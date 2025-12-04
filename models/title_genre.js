const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('title_genre', {
    tconst: {
      type: DataTypes.TEXT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'title',
        key: 'tconst'
      }
    },
    genre_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'genre',
        key: 'genre_id'
      }
    }
  }, {
    sequelize,
    tableName: 'title_genre',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "title_genre_pkey",
        unique: true,
        fields: [
          { name: "tconst" },
          { name: "genre_id" },
        ]
      },
      {
        name: "title_genre_tconst_idx",
        fields: [
          { name: "tconst" },
        ]
      },
      {
        name: "title_genre_genre_id_idx",
        fields: [
          { name: "genre_id" },
        ]
      },
    ]
  });
};
