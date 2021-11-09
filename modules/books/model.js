const booksModel = (sequelize, Sequelize) => {
    const books = sequelize.define("book", {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        title: { type: Sequelize.STRING },
        authorId: { type: Sequelize.INTEGER }
    })

    return books
}

export default booksModel