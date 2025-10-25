
const DataTypes = require('sequelize').DataTypes;
const { sequelize } = require('../configs/mysql');
const User = require('../models/userModels')

const RateLimitCheck = sequelize.define('RateLimitCheck',{
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    tries:{
        type:DataTypes.INTEGER,
        allowNull: false,
        defaultValue:0
    },
    blockExpireDate:{
        type:DataTypes.DATE,
        defaultValue:DataTypes.DATE,
        allowNull:true
    }
},{
    timestamps:true,
    tableName:'ratelimitcheck'
})

User.hasOne(RateLimitCheck,{foreignKey:'userId',onDelete:'CASCADE'})
RateLimitCheck.belongsTo(User,{foreignKey:'userId'})
module.exports=RateLimitCheck