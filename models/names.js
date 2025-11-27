const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const Names = sequelize.define('names' , {
    nconst: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    birthYear: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    deathYear: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    tableName: 'Names',
    freezeTableName: true,
    timestamps: false,
    indexes: [
        {
            fields: ['name'],
        },
    ],
})

module.exports = Names;