const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('title_principals', {
    tconst: {
      type: DataTypes.TEXT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'title',
        key: 'tconst'
      }
    },
    ordering: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nconst: {
      type: DataTypes.TEXT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'names',
        key: 'nconst'
      }
    },
    category: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    job: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    characters: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'title_principals',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "title_principals_pkey",
        unique: true,
        fields: [
          { name: "tconst" },
          { name: "ordering" },
          { name: "nconst" },
        ]
      },
      {
        name: "title_principals_tconst_idx",
        fields: [
          { name: "tconst" },
        ]
      },
      {
        name: "title_principals_nconst_idx",
        fields: [
          { name: "nconst" },
        ]
      },
      {
        name: "title_principals_category_idx",
        fields: [
          { name: "category" },
        ]
      },
    ]
  });
};
