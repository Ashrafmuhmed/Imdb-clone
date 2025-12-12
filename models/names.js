const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('names', {
    nconst: {
      type: DataTypes.TEXT,
      allowNull: false,
      primaryKey: true
    },
    primary_name: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    birth_year: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    death_year: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    primary_profession: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true
    },
    known_for_titles: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'names',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "names_pkey",
        unique: true,
        fields: [
          { name: "nconst" },
        ]
      },
      {
        name: "names_primary_name_idx",
        fields: [
          { name: "primary_name" },
        ]
      },
      {
        name: "names_primary_name_lower_idx",
        using: "BTREE",
        fields: [sequelize.literal('LOWER("primary_name")')],
      },
      {
        name: "names_popularity_score_idx",
        fields: [
          { name: "popularity_score" },
        ]
      },
    ]
  });
};
