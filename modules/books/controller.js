import { CustomError } from '../../helpers/errorHandler.js'
import redisHelper from '../../helpers/redis.js'
import conn from '../../config/connection.js'
import redis from 'redis'

const redisClient = redis.createClient()

const bookModel = conn.books
const authorModel = conn.authors

const getAllData = async (req, res, next) => {
    let response = { status: 200, message: 'success', data: null }

    try {
        let result = await redisHelper.getOrSetCache('books', async () => {
            let newData = await bookModel.findAll({
                attributes: ['id', 'title'],
                include: {
                    model: authorModel,
                    required: false,
                    attributes: ['id', 'name']
                }
            })
            return newData
        })

        response.data = result
    } catch (error) {
        console.error(error)
        return next(new CustomError('Something went wrong, please try again later!', 500))
    }

    res.status(response.status).send(response)
}

const getData = async (req, res, next) => {
    let response = { status: 200, message: 'success', data: null }
    let { id } = req.params

    try {
        let result = await redisHelper.getOrSetCache(`book:${id}`, async () => {
            let bookData = await bookModel.findOne({
                attributes: ['id', 'title', ],
                where: { id },
                include: {
                    attributes: ['id', 'name'],
                    model: authorModel,
                    required: false,
                }
            })

            return bookData
        })

        response.data = result
    } catch (error) {
        console.error(error)
        return next(new CustomError())
    }

    res.send(response)
}

const addData = async (req, res, next) => {
    let response = { status: 200, message: 'success', data: null }
    let data = req.body

    try {
        if (!Object.keys(data).length) {
            return next(new CustomError('Required data', 400))
        }

        let result = await bookModel.create(data)
        redisClient.del('books')

        response.data = result
    } catch (error) {
        console.log(error)
        return next(new CustomError())
    }

    res.status(response.status).send(response)
}

const updateData = async (req, res, next) => {
    let response = { status: 200, message: 'success', data: null }
    let { id, title, authorId } = req.body

    try {
        let result = await bookModel.update({ title, authorId }, { where: { id } })

        if (result[0]) {
            redisClient.del(`book:${id}`)
            redisClient.del(`books`)
        } else {
            throw Error('Update Failed')
        }
    } catch (error) {
        console.error(error)
        return next(new CustomError('Something went wrong, please try again later!', 500))
    }

    res.status(response.status).send(response)
}

const deleteData = async (req, res, next) => {
    let response = { status: 200, message: 'success', data: null }
    let { id } = req.params

    try {
        let result = await bookModel.destroy({ where: { id } })

        if (result) {
            redisClient.del(`book:${id}`)
            redisClient.del(`books`)
        } else {
            return next(new CustomError('Delete Failed', 400))
        }
    } catch (error) {
        console.error(error)
        return next(new CustomError('Something went wrong, please try again later!', 500))
    }

    res.status(response.status).send(response)
}

export default { getAllData, getData, addData, updateData, deleteData }