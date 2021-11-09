const authorsModel = (sequelize, Sequelize) => {
    const author = sequelize.define("authors", {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: Sequelize.STRING }
    }, {
        freezeTableName: true //stop the auto-pluralization performed by Sequelize
        //tableName: 'Employees' //manual define table name
    })

    return author
}

export default authorsModel