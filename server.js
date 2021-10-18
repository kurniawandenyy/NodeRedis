import express from 'express'
import axios from 'axios'
import redis from 'redis'

const redisClient = redis.createClient()
const app = express()
const PORT = 1000
const DEFAULT_EXPIRATION = 3600

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get('/photos', async (req, res) => {
    const response = { status: 200, message: 'success', data: null }
    const albumId = req.query.albumId

    const result = await getOrSetCache(`photos?albumId=${albumId}`, async () => {
        const { data } = await axios.get('https://jsonplaceholder.typicode.com/photos', { params: { albumId } })
        return data
    })

    if (result) {
        response.data = result
    }

    res.json(response)
})

app.get('/photos/:id', async (req, res) => {
    const response = { status: 200, message: 'success', data: null }

    const result = await getOrSetCache(`photos:${req.params.id}`, async () => {
        const { data } = await axios.get(`https://jsonplaceholder.typicode.com/photos/${req.params.id}`)
        return data
    })

    if (result) {
        response.data = result
    }

    res.json(response)
})

const getOrSetCache = async (key, cb) => {
    return new Promise((resolve, reject) => {
        redisClient.get(key, async (err, data) => {
            if (err) {
                console.log('Error Get Cache: ', err)
                reject(false)
            }

            if (data) return resolve(JSON.parse(data))
            console.log('cache miss')
            const newData = await cb()
            redisClient.setex(key, DEFAULT_EXPIRATION, JSON.stringify(newData))
            resolve(newData)
        })
    })
}

/** Not Found Handler */
app.use((req, res, next) => {
    let err = new Error('URL NOT FOUND!')
    err.status = 404
    next(err)
})

/** Global Error Handler */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    let response = {
        status: err.status,
        message: err.message,
        data: []
    }

    return res.status(err.status).json(response)
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})