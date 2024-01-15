const keytokenModel = require("../models/keytoken.model")
const { Types: { ObjectId } } = require('mongoose')
class KeyTokensService {
  // save publickey and privatekey in database and return publickey
  static createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
    try {
      const filter = { user: userId }
      const update = { publicKey, privateKey, refreshsTokenUsed: [], refreshToken }
      const options = { upsert: true, new: true }
      const tokens = await keytokenModel.findOneAndUpdate(filter, update, options)
      return tokens ? tokens.publicKey : null
    } catch (error) {
      return error
    }
  }

  // find key in keystore with userid
  static findByUserId = async (userId) => {
    return keytokenModel.findOne({ user: new ObjectId(userId) }).lean()
  }
  // delete key in key store with userid
  static deleteKeyById = async (userId) => {
    return await keytokenModel.deleteOne({ user: new ObjectId(userId) })
  }

  // remove key in key store with id
  static removeKeyById = async (id) => {
    return await keytokenModel.deleteOne({ _id: new ObjectId(id) })
  }

  // find key in key store with refreshTokenUsed
  static findByRefreshTokenUsed = async (refreshToken) => {
    return await keytokenModel.findOne({ refreshsTokenUsed: refreshToken }).lean()
  }

  // find key in key store with refreshToken
  static findByRefreshToken = async (refreshToken) => {
    return await keytokenModel.findOne({ refreshToken: refreshToken })
  }

}

module.exports = KeyTokensService
