const { Sequelize, DataTypes } = require('sequelize')
const sequelizeConnection = new Sequelize('postgres://amirhali:satele@localhost:5000/amirhali', {
    define:{
        schema: 'dc_react_expense'
    }
});

const User = sequelizeConnection.define('users', {
    username:{
        type: DataTypes.STRING,
        field: 'username'
    },
    password:{
        type: DataTypes.STRING,
        field: 'password'
    },
    firstName: {
        type: DataTypes.STRING,
        field: 'first_name'
    },
    lastName: {
        type: DataTypes.STRING,
        field: 'last_name'
    },
    budget: {
        type: DataTypes.DECIMAL(10,2),
        field: 'user_total_budget'
    }
    
}, {
    timestamps: false
});

const Category = sequelizeConnection.define('categories', {
    categoryName: {
        type: DataTypes.STRING,
        field: 'category_name'
    },
    categoryBudget: {
        type: DataTypes.DECIMAL(10,2),
        field: 'category_budget'
    },
    uuid: {
        type: DataTypes.UUID,
        field: 'random_uuid'
    }
}, {
    timestamps: false
});

const Expenses = sequelizeConnection.define('expenses', {
    expenseName: {
        type: DataTypes.STRING,
        field: 'expenses_name'
    },
    expenseAmount: {
        type: DataTypes.DECIMAL(10,2),
        field: 'expense_amount'
    },
    uuid: {
        type: DataTypes.UUID,
        field: 'random_uuid'
    },
    expenseCategory: {
        type: DataTypes.STRING,
        field: 'expense_category'
    },
    expenseBudget: {
        type: DataTypes.DECIMAL(10,2),
        field: 'expense_budget'
    }
}, {
    timestamps: false
})

User.hasMany(Category);
User.hasMany(Expenses);
Category.belongsTo(User, {foreignKey:{allowNull: false}});
Expenses.belongsTo(User, {foreignKey:{allowNull: false}});

sequelizeConnection.authenticate().then(()=> {
    console.log('Database connected successfully');
});
sequelizeConnection.sync({alter: true}).then(()=>{
    console.log('tables created');
}); 