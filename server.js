const express = require('express');
const cors = require('cors');
const http = require('http')
const app = express();
const server = http.createServer(app)
const { Sequelize, DataTypes } = require('sequelize')
const port = 4000
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
app.use(express.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://127.0.0.1:5500");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.listen(port, '127.0.0.1', ()=>{
    console.log(`server running on ${port}`);
});
app.use(cors());

// USER ENDPOINTS
app.get('/user/log/:username', (req, res)=>{
    const user = req.params['username'];
    console.log(user)
    sequelizeConnection.sync().then(()=>{
        return User.findOne({where: {username: user}})
    }).then((foundUser)=> {
        if(foundUser){
            res.status(200).send(foundUser)
        }else{
            res.status(404).send('Not found.');
        }
    })
})
app.post('/user', (req, res)=> {
    const createThisUser = req.body;
    console.log(createThisUser);
    User.findOne({where: {username: createThisUser.username}}).then((foundUser) => {
        if(!foundUser){
            User.create({
                username: createThisUser.username,
                password: createThisUser.password, 
                firstName: createThisUser.firstName,
                lastName: createThisUser.lastName
            })
            res.status(200).send('Success.')
        }else{
            res.status(409).send('Unsuccessful.')
        }
    })
})
app.put('/total-budget/:username/:amount', (req, res) => {
    const user = req.params['username'];
    const amount = req.params['amount'];
    console.log(amount)
    sequelizeConnection.sync().then(()=> {
        User.update({budget: amount}, {where: {username: user}}).then(()=>{
            res.status(200).send('Budget updated.')
        }).catch(error => {
            console.log(error)
            res.status(500).send(error)
        })
    })
});

// CATEGORY ENDPOINTS
app.get('/get-category/:uuid', (req, res) => {
    const uuid = req.params['uuid'];

    Category.findOne({where:{uuid: uuid}}).then((found) =>{
        if(found){
            res.status(200).send(found)
        }
    })
})
app.get('/reload-category/:userId', (req, res) => {
    const userId = req.params['userId'];

    Category.findAll({where:{userId: userId}}).then((found) =>{
        if(found){
            res.status(200).send(found)
        }else{
            res.status(404).send('Not Found.')
        }
    });
})
app.post('/category', (req, res) => {
    let user, category
    const data = req.body;

    sequelizeConnection.sync().then(()=>{
        Category.create({
            categoryName: data.category,
            categoryBudget: data.catAmount,
            uuid: data.uuid
        })
        return User.findOne({where:{username: data.username}})
    }).then((foundUser)=> {
        user = foundUser
        return Category.findOne({where: {uuid: data.uuid}})
    }).then((foundCategory) => {
        if(foundCategory){
            category = foundCategory
            user.addCategory(category)
            res.status(200).send('Success')
        } 
    }).catch(error => {
        if(error){
            res.send('error');
        }
    })
});

// EXPENSE ENDPOINTS 
app.get('/reload-expense/:userId', (req, res)=> {
    const userId = req.params['userId'];

    Expenses.findAll({where:{userId: userId}}).then((found) =>{
        if(found){
            res.status(200).send(found)
        }else{
            res.status(404).send('Not Found.')
        }
    });
})
app.get('/get-expense/:uuid', (req, res) => {
    const uuid = req.params['uuid'];

    Expenses.findOne({where:{uuid: uuid}}).then((found) =>{
        if(found){
            res.status(200).send(found)
        }
    })
})
app.post('/expenses', (req, res)=> {
    let user, expense;
    const addThis = req.body;

    sequelizeConnection.sync().then(()=> {
        Expenses.create({
            expenseName: addThis.expenseName,
            expenseAmount: addThis.expenseAmount,
            uuid: addThis.uuid,
            expenseCategory: addThis.expenseCategory,
            expenseBudget: addThis.expenseBudget
        })
        return User.findOne({where: {username: addThis.username}})
    }).then((foundUser)=> {
        user = foundUser;
        return Expenses.findOne({where: {uuid: addThis.uuid}})
    }).then((foundExpense)=> {
        if(foundExpense){
            expense = foundExpense;
            user.addExpenses(expense)
            res.status(200).send('Success.')
        }
    }).catch(error => {
        if(error){
            res.send('error');
        }
    })
});

app.delete('/remove-expense/:uuid', (req, res) => {
    const uuid = req.params['uuid']

    Expenses.destroy({where: {uuid: uuid}}).then(()=> {
        res.status(200).send('Success.')
    }).catch((error)=> {
        res.status(404).send('Not Found');
    })
})