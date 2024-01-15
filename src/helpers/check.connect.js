const mongoose = require('mongoose')
const os = require('os')
const _SECONDS = 5000

const countConnect = () => {
  const numConnection = mongoose.connections.length
  console.log(`Number connection :: ${numConnection}`);
}

const checkOverLoad = () => {
  setInterval(() => {
    const numConnection = mongoose.connect.length
    const numCores = os.cpus().length
    const memoryUsage = process.memoryUsage().rss
    // example maximum number of connection based on number osf cores
    const maxConnection = numCores * 5

    console.log(`Active Connection ::: ${numConnection}`);
    console.log(`Memory Usage ::: ${memoryUsage / 1024 / 1024}MB`);

    if (numConnection > maxConnection) {
      console.log(`Connection overload detected`);
    }
  }, _SECONDS);
}


module.exports = {
  countConnect,
  checkOverLoad
}
