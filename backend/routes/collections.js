const express = require('express')
const collections = express.Router()
const dayjs = require('dayjs')
const weekOfYear = require('dayjs/plugin/weekOfYear')
const builder = require('../builder')
const { formatName } = require('../utils/utils')

dayjs.extend(weekOfYear)

collections.get('/week', async (req, res) => {
  
  const DAYWEEK = 7
  const currentDay = dayjs().day()
  const difference = DAYWEEK - currentDay - 1
  const from = dayjs().subtract(currentDay, 'day').format('YYYY-MM-DD')
  const to = dayjs().add(difference, 'day').format('YYYY-MM-DD')

  try {
    const weeklyCollection = await builder(builder.raw('loan_detail as l_d'))
      .select(
        'due_date',
        'l_d.loan_header_id',
        'l_d.loan_detail_id',
        'monthly_amortization',
        'monthly_interest',
        'monthly_principal',
        'accumulated_penalty',
        'net_proceeds'
      )
      .orderBy('due_date', 'asc')
      .havingBetween('due_date', [from , to])
        // pn_number
        .modify((subBuilder, foreignKey) => {
          subBuilder.innerJoin(builder.raw('loan_headertbl as l_h'), foreignKey, 'l_h.loan_header_id').select('pn_number')
          // payment status    
          .modify((subBuilder, foreignKey) => {
            subBuilder.leftJoin(builder.raw('paymenttbl as p'), foreignKey, 'p.loan_detail_id').select(builder.raw('ifnull(payment_status_id, 0) as payment_status_id'), builder.raw('ifnull(payment_id, 0) as payment_id'), builder.raw(`ifnull(receiptno, "") as pr_number`))
          }, 'l_d.loan_detail_id',)
          // customer name
          .modify((subBuilder, foreignKey)=> {
            subBuilder.innerJoin(builder.raw('customertbl as c'), foreignKey, 'c.customerid').select('clname','cfname','cmname', )
          },'l_h.customer_id')
    }, 'l_d.loan_header_id')

    const formatWeeklyCollection = weeklyCollection.map(v => ({...v, full_name : formatName(v), due_date : dayjs(v.due_date).format('MM-DD-YYYY')}))
    res.status(200).json({success : true, data : formatWeeklyCollection})
  }catch(err) {
    console.log(err)
    res.status(500).json({success : false})
  } 
})

collections.get('/month', async (req, res) => {

  try {
    const monthlyCollection = await builder(builder.raw('loan_detail as l_d'))
      .select(
        'due_date',
        'l_d.loan_header_id',
        'l_d.loan_detail_id',
        'monthly_amortization',
        'monthly_interest',
        'monthly_principal',
        'accumulated_penalty',
        'net_proceeds',
      )
      .orderBy('due_date', 'asc')
      .whereRaw(`month(due_date) = ?`, [dayjs().month() + 1]).andWhereRaw(`year(due_date) = ?`, [dayjs().year()])
      .modify((subBuilder, foreignKey) => {
        subBuilder.innerJoin(builder.raw('loan_headertbl as l_h'), foreignKey, 'l_h.loan_header_id').select('pn_number')
        // payment status    
        .modify((subBuilder, foreignKey) => {
          subBuilder.leftJoin(builder.raw('paymenttbl as p'), foreignKey, 'p.loan_detail_id').select(builder.raw('ifnull(payment_status_id, 0) as payment_status_id'), builder.raw('ifnull(payment_id, 0) as payment_id'), builder.raw(`ifnull(receiptno, "") as pr_number`))
        }, 'l_d.loan_detail_id',)
        // customer name
        .modify((subBuilder, foreignKey)=> {
          subBuilder.innerJoin(builder.raw('customertbl as c'), foreignKey, 'c.customerid').select('clname','cfname','cmname', )
        },'l_h.customer_id')
      }, 'l_d.loan_header_id')
      const formatMonthlyCollection = monthlyCollection.map(v => ({...v, full_name : formatName(v), due_date : dayjs(v.due_date).format('MM-DD-YYYY')}))
      res.status(200).json({success : true, data : formatMonthlyCollection})
    } catch (error) {
      // throw new Error(error.message)
      res.status(500).json({success : false})
      console.log(error)
  }
})

collections.get('/year', async (req, res) => {
  try {
      
    const yearlyCollection = await builder(builder.raw('loan_detail as l_d'))
      .select(
        'due_date',
        'l_d.loan_header_id',
        'l_d.loan_detail_id',
        'monthly_amortization',
        'monthly_interest',
        'monthly_principal',
        'accumulated_penalty',
        'net_proceeds',
      ).orderBy('due_date', 'asc')
      .whereRaw(`year(due_date) = ?`, [dayjs().year()])
      .modify((subBuilder, foreignKey) => {
        subBuilder.innerJoin(builder.raw('loan_headertbl as l_h'), foreignKey, 'l_h.loan_header_id').select('pn_number')
        // payment status    
        .modify((subBuilder, foreignKey) => {
          subBuilder.leftJoin(builder.raw('paymenttbl as p'), foreignKey, 'p.loan_detail_id').select(builder.raw('ifnull(payment_status_id, 0) as payment_status_id'), builder.raw('ifnull(payment_id, 0) as payment_id'), builder.raw(`ifnull(receiptno, "") as pr_number`))
        }, 'l_d.loan_detail_id',)
        // customer name
        .modify((subBuilder, foreignKey)=> {
          subBuilder.innerJoin(builder.raw('customertbl as c'), foreignKey, 'c.customerid').select('clname','cfname','cmname', )
        },'l_h.customer_id')
      }, 'l_d.loan_header_id')
      const formatYearlyCollection = yearlyCollection.map(v => ({...v, full_name : formatName(v), due_date : dayjs(v.due_date).format('MM-DD-YYYY')}))
      
      res.status(200).json({success : true, data: formatYearlyCollection})
  } catch (error) {
      res.status(500).json({success: false})
  }
})

collections.get('/income', async(req, res) => {
  try {
    const income = await builder('payment_historytbl')
    .select(builder.raw('payment_interest as total, payment_date as date'))
    .whereRaw(`month(payment_date) = ?`, [dayjs().month() + 1])
    
    const monthly = income.reduce((total, curr) => total + Number(curr.total), 0)
    const daily = income.filter((value) => dayjs(value.date).isSame(dayjs(), 'day'))
                  .reduce((total, curr) => total + Number(curr.total), 0)
    const weekly = income.filter((value) => dayjs(value.date).week() === dayjs().week())
                  .reduce((total, curr) => total + Number(curr.total), 0)
    
    res.status(200).json({
      success : true, 
      data : {
        daily : daily,
        weekly : weekly,
        monthly : monthly,
      }
    })
  } catch (error) {
    res.status(500).json({success : false})
  }
})

module.exports = collections