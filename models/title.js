const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('title', {
    tconst: {
      type: DataTypes.TEXT,
      allowNull: false,
      primaryKey: true
    },
    title_type: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    primary_title: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    original_title: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_adult: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    start_year: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    end_year: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    runtime_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'title',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "title_pkey",
        unique: true,
        fields: [
          { name: "tconst" },
        ]
      },
      {
        name: "title_primary_title_idx",
        fields: [
          { name: "primary_title" },
        ]
      },
      {
        name: "title_original_title_idx",
        fields: [
          { name: "original_title" },
        ]
      },
      {
        name: "title_type_idx",
        fields: [
          { name: "title_type" },
        ]
      },
      {
        name: "title_start_year_idx",
        fields: [
          { name: "start_year" },
        ]
      },
      {
        name: "title_type_year_idx",
        fields: [
          { name: "title_type" },
          { name: "start_year" },
        ]
      },
    ]
  });
};
