const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('title_episode', {
    tconst: {
      type: DataTypes.TEXT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'title',
        key: 'tconst'
      }
    },
    parent_tconst: {
      type: DataTypes.TEXT,
      allowNull: true,
      references: {
        model: 'title',
        key: 'tconst'
      }
    },
    season_number: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    episode_number: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'title_episode',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "title_episode_pkey",
        unique: true,
        fields: [
          { name: "tconst" },
        ]
      },
      {
        name: "title_episode_parent_tconst_idx",
        fields: [
          { name: "parent_tconst" },
        ]
      },
    ]
  });
};
