const JWT = require('jsonwebtoken')
const { asyncHandler } = require('../helpers/asyncHandler')
const { AuthFailuredError, NotFoundError } = require('../core/error.response')
const { findByUserId } = require('../services/keyToken.service')

const HEADER = {
  API_KEY: 'x-api-key',
  CLIENT_ID: 'x-client-id',
  AUTHORIZATION: 'athorization',
  REFRESHTOKEN: 'x-rtoken-id'
}

const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    // accessToken
    const accessToken = await JWT.sign(payload, publicKey, {
      expiresIn: '2 days'
    })
    // refreshToken
    const refreshToken = await JWT.sign(payload, privateKey, {
      expiresIn: '7 days'
    })

    // verify accessToken
    JWT.verify(accessToken, publicKey, (error, decode) => {
      if (error) {
        console.log(`Error verify ::`, error);
      } else {
        console.log(`Decode verify ::`, decode);
      }
    })
    return { accessToken, refreshToken }
  } catch (error) {
    return error
  }
}

//v1
const authorization = asyncHandler(async (req, res, next) => {
  // 1 - check userId misssing
  const userId = req.headers[HEADER.CLIENT_ID]
  if (!userId) throw new AuthFailuredError('Invalid Request')
  // 2-get key store
  const keyStore = await findByUserId(userId)
  if (!keyStore) throw new NotFoundError('Not Found')
  // 3-get accestoken
  const accessToken = req.headers[HEADER.AUTHORIZATION]
  if (!accessToken) throw new AuthFailuredError('Invalid Request')
  //4-decode
  try {
    const decode = JWT.verify(accessToken, keyStore.publicKey)
    if (userId !== decode.userId) throw new AuthFailuredError('Invalid user')
    req.keyStore = keyStore
    return next()
  } catch (error) {
    throw error
  }
})


//v2
const authorizationv2 = asyncHandler(async (req, res, next) => {
  // 1 - check userId misssing
  const userId = req.headers[HEADER.CLIENT_ID]
  if (!userId) throw new AuthFailuredError('Invalid Request')
  // 2-get key store
  const keyStore = await findByUserId(userId)
  if (!keyStore) throw new NotFoundError('Not Found')
  // 3-get refreshtoken
  if (req.headers[HEADER.REFRESHTOKEN]) {
    try {
      const refreshToken = req.headers[HEADER.REFRESHTOKEN]
      const decode = JWT.verify(refreshToken, keyStore.privateKey)
      if (userId !== decode.userId) throw new AuthFailuredError('Invalid user')
      req.keyStore = keyStore
      req.user = decode // {userId, email}
      req.refreshToken = refreshToken
      return next()
    } catch (error) {
      throw error
    }
  }
  // get accessToken after refreshToken
  const accessToken = req.headers[HEADER.AUTHORIZATION]
  if (!accessToken) throw new AuthFailuredError('Invalid Request')
  //4-decode
  try {
    const decode = JWT.verify(accessToken, keyStore.publicKey)
    if (userId !== decode.userId) throw new AuthFailuredError('Invalid user')
    req.keyStore = keyStore
    req.user = decode
    return next()
  } catch (error) {
    throw error
  }
})



const verifyJWT = async (token, keySecret) => {
  return await JWT.verify(token, keySecret)
}

module.exports = {
  createTokenPair,
  authorization,
  authorizationv2,
  verifyJWT
}
