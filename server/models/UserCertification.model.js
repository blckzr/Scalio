const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserCertification = sequelize.define('UserCertification', {
  user_certification_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  certification_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  issued_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  issued_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  roadmap_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'issued',
    validate: {
      isIn: [['issued', 'revoked', 'pending']],
    },
  },
}, {
  tableName: 'user_certifications',
  timestamps: false,
});

module.exports = UserCertification;
