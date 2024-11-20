const express = require('express')
const builder = require('../builder')
const dayjs = require('dayjs')
const reportsRouter = express.Router()

reportsRouter.get('/',async (req, res) => {
  try {
    //get all the payment for today
    const now = dayjs().format('YYYY-MM-DD') 

    const payment = await builder.select('*').from('view_reports').whereRaw('payment_date = ?', [ now ])
    const denoms = await builder.select('*').from('daily_report_historytbl').whereRaw('process_date = ?', [now])
    // console.log(denoms)
    const formatDenoms = denoms.map((v) => ({
      id: v.daily_report_history_id,
      type: v.type_bill,
      denomination : Number(v.denomination),
      quantity : Number(v.quantity),
      total: Number(v.TotalAmount),
    }))
    // console.log(formatDenoms)
    const total = payment.reduce((acc, curr) => acc + Number(curr.total), 0)
    
    res.status(200).json({
      success : true,
      total : total, 
      details : payment,
      denoms : formatDenoms
    })

  } catch (error) {
    
  }
})

reportsRouter.post('/', async (req, res) => {
  try {
    const {denoms} = req.body
  
    const proneData = denoms.map((v) => ({
      type_bill : v.type,
      denomination : v.denomination,
      quantity: v.quantity,
      TotalAmount: v.total,
      process_date: dayjs().format('YYYY-MM-DD')
    }))
    
    await builder('daily_report_historytbl').insert(proneData)

    res.status(200).json({success : true})
  } catch (error) {
    
    res.status(500).json({success : false})
  }

})

module.exports = reportsRouter