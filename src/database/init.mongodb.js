const mongoose = require('mongoose')
const { countConnect } = require('../helpers/check.connect')
const { db: { host, port, name } } = require('../configs/config.mongodb')

// connect string
// const connectString = `mongodb://${host}:${port}/${name}`
const connectString = `mongodb+srv://xuantruong200101:18102001@shopdev.eep7kwx.mongodb.net/`

class Database {
  constructor() {
    this.connect()
  }
  // connect
  connect(type = 'mongodb') {
    if (1 === 1) {
      mongoose.set('debug', true)
      mongoose.set('debug', { color: true })
    }
    mongoose.connect(connectString)
      .then(_ => console.log(`Connect MongoDb Sussess`, countConnect()))
      .catch(err => console.log(`Error Connect`))
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database()
    }
    return Database.instance
  }
}

const instanceMongodb = Database.getInstance()
module.exports = instanceMongodb
