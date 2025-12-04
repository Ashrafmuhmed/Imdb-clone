const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('watchlist', {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'user',
                key: 'user_id'
            }
        },
        tconst: {
            type: DataTypes.TEXT,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'title',
                key: 'tconst'
            }
        }
    }, {
        sequelize,
        tableName: 'watchlist',
        schema: 'public',
        timestamps: false,
        indexes: [
            {
                name: "watchlist_pkey",
                unique: true,
                fields: [
                    {name: "user_id"},
                    {name: "tconst"},
                ]
            },
            {
                name: "watchlist_user_id_idx",
                fields: [
                    {name: "user_id"},
                ]
            },
            {
                name: "watchlist_tconst_idx",
                fields: [
                    {name: "tconst"},
                ]
            },
        ]
    });
};

