import express from 'express'

import routes from './routes.js'

const app = express()
const PORT = 1000

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use('/', routes)

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