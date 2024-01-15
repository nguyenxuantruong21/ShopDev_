
const { unSelectData, getSelectData } = require('../../utils')


const checkDiscountExist = async ({ model, filter }) => {
  return await model.findOne(filter).lean()
}

const findAllDiscountCodesUnSelect = async ({
  limit = 50, page = 0, sort = 'ctime', filter, unSelect, model
}) => {
  const skip = (page - 1) * limit
  const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
  const documents = await model.find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(unSelectData(unSelect))
    .lean()

  return documents
}


const findAllDiscountCodesSelect = async ({
  limit = 50, page = 0, sort = 'ctime', filter, select, model
}) => {
  const skip = (page - 1) * limit
  const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
  const documents = await model.find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean()

  return documents
}

module.exports = {
  findAllDiscountCodesUnSelect, findAllDiscountCodesSelect, checkDiscountExist
}
