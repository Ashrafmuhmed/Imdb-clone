const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const User = sequelize.define('user' , {
    userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique:true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    resetToken : {
        type : DataTypes.STRING , 
        allowNull : true 
    },
    resetTokenExpiry: { 
        type : DataTypes.DATE , 
        allowNull : true 
    }
}, {
    tableName: 'Users',
    freezeTableName: true,
    timestamps: false,
    indexes: [
        {
            fields: ['email'],
            unique: true,
        },
    ],
})

module.exports = User;