const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('title_crew', {
        tconst: {
            type: DataTypes.TEXT,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'title',
                key: 'tconst'
            }
        },
        directors: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            allowNull: true
        },
        writers: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            allowNull: true
        }
    }, {
        sequelize,
        tableName: 'title_crew',
        schema: 'public',
        timestamps: false,
        indexes: [
            {
                name: "title_crew_pkey",
                unique: true,
                fields: [
                    {name: "tconst"},
                ]
            },
        ]
    });
};
