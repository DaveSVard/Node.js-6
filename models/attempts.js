const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Attempt = sequelize.define("Attempts", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    time: DataTypes.BIGINT,
    attempt: DataTypes.INTEGER,
  });

  Attempt.associate = (models) => {
    Attempt.belongsTo(models.Users, { foreignKey: "userId" });
  };

  return Attempt;
};
