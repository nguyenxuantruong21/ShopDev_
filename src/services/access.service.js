const shopModel = require("../models/shop.model")
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokensService = require("./keyToken.service")
const { createTokenPair, verifyJWT } = require("../auth/authUtils")
const { getInfoData } = require('../utils/index')
const { BadRequestError, AuthFailuredError, ForbiddenError } = require('../core/error.response')
const { findByEmail } = require('./shop.service')
const { Types: { ObjectId } } = require('mongoose')
const keytokenModel = require("../models/keytoken.model")

const RoleShop = {
  SHOP: 'SHOP',
  WRITER: 'WRITER',
  EDITOR: 'EDITOR',
  ADMIN: 'ADMIN'
}
class AccessService {
  /**
   *check this refreshToken v1
   */
  // static handlerRefreshToken = async (refreshToken) => {
  //   // check xem token nay da duoc su dung chua trong refreshTokenUsed
  //   const foundRefreshToken = await KeyTokensService.findByRefreshTokenUsed(refreshToken)
  //   if (foundRefreshToken) {
  //     // decode refreshToken xem la thang nao
  //     const { userId, email } = await verifyJWT(refreshToken, foundRefreshToken.privateKey)
  //     // neu co thi xoa tat ca token trong keyStore
  //     await KeyTokensService.deleteKeyById(userId)
  //     throw new ForbiddenError('Some thing wrong happen. Please relogin')
  //   }
  //   // No => tim trong refreshToken
  //   const holderToken = await KeyTokensService.findByRefreshToken(refreshToken)
  //   if (!holderToken) throw new AuthFailuredError('Shop not registerd')
  //   // verify token
  //   const { userId, email } = await verifyJWT(refreshToken, holderToken.privateKey)
  //   // check userId ton tai nua hay ko
  //   const foundShop = await findByEmail({ email })
  //   if (!foundShop) throw new AuthFailuredError('Shop not registerd')
  //   // created 1 cap token moi
  //   const tokens = await createTokenPair({ userId: foundShop._id, email }, holderToken.publicKey, holderToken.privateKey)
  //   // update refreshToken moi va set lai refreshToken cu vao refreshsTokenUsed
  //   await holderToken.updateOne({
  //     $set: {
  //       refreshToken: tokens.refreshToken
  //     },
  //     $addToSet: {
  //       refreshsTokenUsed: refreshToken
  //     }
  //   })
  //   return {
  //     userId: { userId, email },
  //     tokens
  //   }
  // }

  // V2
  static handlerRefreshTokenV2 = async ({ keyStore, user, refreshToken }) => {
    const { userId, email } = user
    if (keyStore.refreshsTokenUsed.includes(refreshToken)) {
      await KeyTokensService.deleteKeyById(userId)
      throw new ForbiddenError('Some thing wrong happen. Please relogin')
    }
    if (keyStore.refreshToken !== refreshToken) throw new AuthFailuredError('Shop not registerd')
    const foundShop = await findByEmail({ email })
    if (!foundShop) throw new AuthFailuredError('Shop not registerd')
    // created 1 cap token moi
    const tokens = await createTokenPair({ userId, email }, keyStore.publicKey, keyStore.privateKey)
    // update refreshToken moi va set lai refreshToken cu vao refreshsTokenUsed
    await keytokenModel.updateOne({ user: new ObjectId(userId) }, {
      $set: {
        refreshToken: tokens.refreshToken
      },
      $addToSet: {
        refreshsTokenUsed: refreshToken
      }
    })

    return {
      user,
      tokens
    }
  }

  static logOut = async (keyStore) => {
    const delKey = await KeyTokensService.removeKeyById(keyStore._id)
    return delKey
  }

  static logIn = async ({ email, password, refreshToken = null }) => {
    const foundShop = await findByEmail({ email })
    if (!foundShop) {
      throw new BadRequestError('Shop is not register')
    }
    const match = bcrypt.compare(password, foundShop.password)
    if (!match) {
      throw new AuthFailuredError('Authorization Error')
    }
    const privateKey = crypto.randomBytes(64).toString('hex')
    const publicKey = crypto.randomBytes(64).toString('hex')

    const tokens = await createTokenPair({ userId: foundShop._id, email }, publicKey, privateKey)
    await KeyTokensService.createKeyToken({
      userId: foundShop._id,
      publicKey,
      privateKey,
      refreshToken: tokens.refreshToken
    })
    return {
      shop: getInfoData({ object: foundShop, fileds: ['_id', 'name', 'email'] }),
      tokens
    }
  }

  static signUp = async ({ name, email, password }) => {
    // step1: check email exists
    const hodelShop = await shopModel.findOne({ email }).lean()
    if (hodelShop) {
      throw new BadRequestError('Error:: Shop already register !!!')
    }
    // step2: hash password
    const passwordHash = await bcrypt.hash(password, 10)
    // step3: created shop
    const newShop = await shopModel.create({
      name, email, password: passwordHash, roles: [RoleShop.SHOP]
    })
    if (newShop) {
      // step4: created privatekey, publickey
      const privateKey = crypto.randomBytes(64).toString('hex')
      const publicKey = crypto.randomBytes(64).toString('hex')
      // step5: get keystore from dataBase => publickey
      const keyStore = await KeyTokensService.createKeyToken({
        userId: newShop._id,
        publicKey,
        privateKey,
      })
      if (!keyStore) {
        return {
          code: 'xxx',
          message: 'PublicKeyString Error'
        }
      }
      // created token pair about accesstoken and refreshtoken
      const tokens = await createTokenPair({ userId: newShop._id, email }, publicKey, privateKey)
      return {
        code: 201,
        metadata: {
          shop: getInfoData({ object: newShop, fileds: ['_id', 'name', 'email'] }),
          tokens
        }
      }
    }
    return {
      code: 200,
      metadata: null
    }
  }
}

module.exports = AccessService
