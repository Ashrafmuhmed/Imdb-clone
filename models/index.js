const sequelize = require("../utils/database");
const initModels = require("./init-models");

// Initialize models only once
const models = initModels(sequelize);

module.exports = models;

