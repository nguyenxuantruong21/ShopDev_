const redis = require('redis')
const { promisify } = require('util')
const { reservationInventory } = require('../models/repositories/inventory.repo')
const redisClient = redis.createClient()

// const pexpire = promisify(redisClient.pexpire).bind(redisClient)
// const setnxAsync = promisify(redisClient.setnx).bind(redisClient)
const pexpire = promisify(redisClient.pExpire).bind(redisClient)
const setnxAsync = promisify(redisClient.setNX).bind(redisClient)
const acquireLock = async (productId, quantity, cartId) => {
  const key = `lock_v2023_${productId}`
  const retryTime = 10
  const expireTime = 3000 // 3 seconds

  for (let index = 0; index < retryTime.length; index++) {
    // tao 1 key, thang nao nam giu duoc vao thanh toan
    const result = await setnxAsync(key, expireTime)
    if (result === 1) {
      // theo tac voi inventory
      const isReversation = await reservationInventory({
        productId,
        cartId,
        quantity
      })
      if (isReversation.modifiedCount) {
        await pexpire(key, expireTime)
        return key
      }
      return null
    } else {
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  }
}

const releaseLock = async (keyLock) => {
  const delAsyncKey = promisify(redisClient.del).bind(redisClient)
  return await delAsyncKey(keyLock)
}

module.exports = {
  acquireLock,
  releaseLock
}
