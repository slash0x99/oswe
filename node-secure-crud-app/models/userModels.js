const DataTypes = require('sequelize').DataTypes;
const { sequelize } = require('../configs/mysql');

const User = sequelize.define('User',{
    id: {  
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    username:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true   
    },
    email:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true
    },
    password:{
        type:DataTypes.STRING,
        allowNull:false
    },
    refreshToken: {type:DataTypes.STRING},
    tokenVersion: {
        type: DataTypes.INTEGER,
        defaultValue: 0
        },
    isAdmin:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    }

},{
    timestamps:true,
    tableName:'users'
});

module.exports = User;