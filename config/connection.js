import Sequelize from 'sequelize'
import authorsModel from '../modules/authors/model.js'
import booksModel from '../modules/books/model.js'

const sequelize = new Sequelize('db_graphql', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
})

const db = {}
db.sequelize = sequelize
db.Sequelize = Sequelize

db.authors = authorsModel(sequelize, Sequelize)
db.books = booksModel(sequelize, Sequelize)

//Relations
db.authors.hasMany(db.books)
db.books.belongsTo(db.authors)

sequelize.authenticate()
.then(() => {
        sequelize.sync()
        console.log('Connection has been established successfully')
    }).catch((error) => {
        console.log('Unable to connect to database:', error.message)
        // process.exit()
    })

export default db