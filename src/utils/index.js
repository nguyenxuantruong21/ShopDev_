const _ = require('lodash')
const { Types: { ObjectId } } = require('mongoose')

const getInfoData = ({ fileds = [], object = {} }) => {
  return _.pick(object, fileds)
}

const getSelectData = (select = []) => {
  return Object.fromEntries(select.map(el => [el, 1]))
}

const unSelectData = (select = []) => {
  return Object.fromEntries(select.map(el => [el, 0]))
}

const removeUndefineObject = obj => {
  Object.keys(obj).forEach(k => {
    if (obj[k] === null)
      delete obj[k]
  })
  return obj
}

/**
 *
 * @param  obj
 * @returns  {final object}
 */


const updateNestedObjectParser = object => {
  const final = {}
  Object.keys(object || {}).forEach(key => {
    if (typeof object[key] === 'object' && !Array.isArray(object[key])) {
      const response = updateNestedObjectParser(object[key])
      Object.keys(response || {}).forEach(a => {
        final[`${key}.${a}`] = response[a]
      })
    } else {
      final[key] = object[key];
    }
  });
  return final
}

const convertToObjectId = (id) => {
  return new ObjectId(id)
}

module.exports = {
  unSelectData, getInfoData, getSelectData, removeUndefineObject, updateNestedObjectParser, convertToObjectId
}
