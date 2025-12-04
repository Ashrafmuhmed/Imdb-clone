const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('genre', {
        genre_id: {
            autoIncrement: true,
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        name: {
            type: DataTypes.TEXT,
            allowNull: true,
            unique: "genre_name_key"
        }
    }, {
        sequelize,
        tableName: 'genre',
        schema: 'public',
        timestamps: false,
        indexes: [
            {
                name: "genre_name_key",
                unique: true,
                fields: [
                    {name: "name"},
                ]
            },
            {
                name: "genre_pkey",
                unique: true,
                fields: [
                    {name: "genre_id"},
                ]
            },
        ]
    });
};
