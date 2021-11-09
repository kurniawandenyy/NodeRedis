import redis from 'redis'

const redisClient = redis.createClient()
const DEFAULT_EXPIRATION = 600

const getOrSetCache = async (key, cb) => {
    return new Promise((resolve, reject) => {
        redisClient.get(key, async (err, data) => {
            if (err) {
                console.log('Error Get Cache: ', err)
                reject(false)
            }

            if (data) {
                console.log('cache data')
                return resolve(JSON.parse(data))
            }
            console.log('cache miss')
            const newData = await cb()
            redisClient.setex(key, DEFAULT_EXPIRATION, JSON.stringify(newData))
            resolve(newData)
        })
    })
}

export default { getOrSetCache }