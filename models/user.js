const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const User = sequelize.define("Users", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: DataTypes.STRING,
    login: DataTypes.STRING,
    password: DataTypes.STRING,
  });

  User.associate = (models) => {
    User.hasOne(models.Attempts, { foreignKey: "userId" });
  };

  return User;
};
