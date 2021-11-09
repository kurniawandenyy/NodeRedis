import express from 'express'

import authorsController from './modules/authors/controller.js'
import booksController from './modules/books/controller.js'

const router = express.Router()

router.get('/', (req, res) => {
    res.send({
        message: 'Welcome to my paradise'
    })
})

//routes authors
router.get('/authors', authorsController.getAllData)
router.get('/author/:id', authorsController.getData)
router.post('/author', authorsController.addData)
router.put('/author', authorsController.updateData)
router.delete('/author/:id', authorsController.deleteData)

//routes books
router.get('/books', booksController.getAllData)
router.get('/book/:id', booksController.getData)
router.post('/book', booksController.addData)
router.put('/book', booksController.updateData)
router.delete('/book/:id', booksController.deleteData)

export default router