const express = require('express')
const bankRouter = express.Router()
const builder = require('../builder')

bankRouter.get('/', async (req, res)=>{
  const banks = await builder.select({id : 'bank_account_id', name : 'bank_name', check_location : 'check_location'}).from('bank_accounttbl')
  res.status(200).json(banks)
})

bankRouter.post('/', async (req, res) =>{
  const { bankName, checkLocation } = req.body
  //TODO: error handling if empty input
  try {
    const bank = await builder('bank_accounttbl').insert({ bank_name : bankName, check_location : checkLocation})
    res.status(200).json({id : bank[0]})
  } catch (error) {
    res.status(500).send()
    console.log(error)
  }  

})




module.exports = bankRouter