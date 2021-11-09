import connect from '../../config/connection.js'
import redisHelper from '../../helpers/redis.js'
import { CustomError } from '../../helpers/errorHandler.js'
import redis from 'redis'
const redisClient = redis.createClient()

const authorsModel = connect.authors
const booksModel = connect.books

const getAllData = async (req, res, next) => {
    let response = { status: 200, message: 'success', data: null }

    try {
        let data = await redisHelper.getOrSetCache(`authors`, async () => {
            let newData = await authorsModel.findAll({
                attributes: ['id', 'name'],
                include: {
                    attributes: ['id', 'title'],
                    model: booksModel,
                    required: false
                }
            })

            return newData
        })

        response.data = data
    } catch (error) {
        console.log(error)
        return next(new CustomError())
    }

    res.status(response.status).send(response)
}

const getData = async (req, res, next) => {
    let response = { status: 200, message: 'success', data: null }
    let { id } = req.params

    try {
        let data = await redisHelper.getOrSetCache(`author:${id}`, async () => {
            let authorData = await authorsModel.findOne({
                attributes: ['id', 'name'],
                where: { id },
                include: {
                    attributes: ['id', 'title'],
                    model: booksModel,
                    required: false
                }
            })

            return authorData
        })

        response.data = data
    } catch (error) {
        console.log(error)
        return next(new CustomError())
    }

    res.status(response.status).send(response)
}

const addData = async (req, res, next) => {
    let response = { status: 200, message: 'success', data: null }
    let data = req.body

    try {
        if (!Object.keys(data).length) {
            return next(new CustomError('Required data', 400))
        }

        let result = await authorsModel.create(data)
        redisClient.del('authors')

        response.data = result
    } catch (error) {
        console.log(error)
        return next(new CustomError('Something went wrong, please try again later!', 500))
    }

    res.status(response.status).send(response)
}

const updateData = async (req, res, next) => {
    let response = { status: 200, message: 'success', data: null }
    let { id, name } = req.body

    try {
        let result = await authorsModel.update({ name }, { where: { id } })

        if (result[0]) {
            redisClient.del(`author:${id}`)
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
        let result = await authorsModel.destroy({ where: { id } })

        if (result) {
            redisClient.del(`author:${id}`)
            redisClient.del(`authors`)
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