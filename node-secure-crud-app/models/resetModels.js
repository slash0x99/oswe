const {DataTypes} = require('sequelize');
const {sequelize} = require('../configs/mysql');
const User = require('./userModels');

const ResetToken = sequelize.define('ResetToken',{
    token:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true
    },
    expireAt:{
        type:DataTypes.DATE,
        allowNull:false
    },
    userId:{ 
        type: DataTypes.UUID,  
        allowNull: false
    }
}, {
    timestamps: true
});

User.hasMany(ResetToken, {foreignKey:'userId', onDelete:'CASCADE'});
ResetToken.belongsTo(User, {foreignKey:'userId'});

module.exports = ResetToken;