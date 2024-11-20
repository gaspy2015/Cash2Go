const express = require('express')
const expensesRouter = express.Router()
const builder = require('../builder')
const dayjs = require('dayjs')

expensesRouter.get('/', async (req, res) => {
  try {
    const expenseHeader = await builder('expenses_header').select('*')
    
    const format = expenseHeader.map(v => ({
      ...v,
      date: dayjs(v.date).format("MM-DD-YYYY"),
      check_details : `${v.bank}-${v.check_number}`
    }))
    
    res.status(200).json(format)
    
  } catch (error) {
    res.status(500).end()
  }
})

expensesRouter.get('/banks', async (req, res) => {
  try {
   const banks = await builder('bank_accounttbl').select({id: 'bank_account_id', name : 'bank_name'}).where('is_owner_bank', true)
   res.status(200).json(banks)
  
  } catch (error) {
    res.status(500).end()
  }
})

expensesRouter.get('/suppliers', async (req, res) => {
  try {
    const supplier = await builder('customertbl').select(builder.raw(`CONCAT_WS(', ' , clname,  cfname, cmname ) as name`), { id : 'customerid'})
    res.status(200).json(supplier)
    
  } catch (error) {
    res.status(500).end()
  }

})

expensesRouter.get('/edit/:id', async (req, res) => {
  try {
    const { id } = req.params
    const expenses_details = await builder('expenses_details').select('id', { title : 'account_title' }, 'expenses_details.account_title_id', 'credit', 'debit').innerJoin('account_titletbl', 'expenses_details.account_title_id', 'account_titletbl.account_title_id').where('expenses_header_id', Number(id))
    
    const format_details = expenses_details.map(v => ({
      category: { id : v.account_title_id, name : v.title},
      debit : Number(v.debit),
      credit : Number(v.credit)
    }))
    

    const [expenses_header] = await builder('expenses_header').select(
      'id',
      {
        borrower : 'payee',
        voucherNumber : 'voucher_number'
      },
      'supplier_id',
      'bank_id',
      'date',
      'check_number',
      'check_date',
      'bank',
      'prepared_by',
      'checked_by',
      'approved_by'
    ).where('id', Number(id))
    
    const formatVoucherDetails = {
      ...expenses_header,
      date: dayjs(expenses_header.date).format('YYYY-MM-DD'),
      bank: { name: expenses_header.bank, id: expenses_header.bank_id},
      borrower: { name: expenses_header.borrower, id : expenses_header.supplier_id},
      voucher_details :format_details,
    }
    res.status(200).json(formatVoucherDetails)

  } catch (error) {
    console.log(error)
    res.status(500).end()
  }

})

expensesRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const expenses_details = await builder('expenses_details').select('id', { title : 'account_title'}, 'credit', 'debit').innerJoin('account_titletbl', 'expenses_details.account_title_id', 'account_titletbl.account_title_id').where('expenses_header_id', Number(id))
    
    const format_details = expenses_details.map(v => ({
      ...v, 
      debit : Number(v.debit),
      credit : Number(v.credit)
    }))

    const [expenses_header] = await builder('expenses_header').select(
      'id',
      {
        borrower : 'payee',
        voucherNumber : 'voucher_number'
      },
      'date',
      'check_number',
      'check_date',
      'bank',
      'voucher_number',
      'prepared_by',
      'checked_by',
      'approved_by'
    ).where('id', Number(id))
  
    res.status(200).json({...expenses_header, details : format_details})
    
  } catch (error) {
    res.status(500).end()
  }

})


expensesRouter.post('/', async (req, res) => {
  const { header, details } = req.body
  const formatHeader = {
    ...header,
    payee: header.payee.name,
    supplier_id: header.payee.id,
    bank: header.bank.name,
    bank_id: header.bank.id
  }

  // return console.log(formatHeader)
  try {
    // return
    const expense = await builder('expenses_header').insert(formatHeader)
    if(expense) {
      const format = details.map(v => ({...v, expenses_header_id : expense[0]}))
      // console.log(format)
      await builder('expenses_details').insert(format)
      res.status(200).end()
    }
  } catch (error) {

    res.status(500).end()
  }
})

expensesRouter.put('/:id', async (req, res) => {
  // console.log()
  const { id } = req.params
  const { header, voucher_details} = req.body
  // return console.log(voucher_details)
  
  try {
    await builder.transaction(async (trx) => {
      const updateId = await trx('expenses_header').update(header).where('id', id)
      
      const del = await trx('expenses_details').where('expenses_header_id', id).del()
      
      const format_details = voucher_details.map(v => ({
        expenses_header_id : Number(id),
        account_title_id: v.category.id,
        credit: Number(v.credit),
        debit: Number(v.debit)
      }))

      await trx('expenses_details').insert(format_details)

      res.status(200).end()
    })
  } catch (error) {
    console.log(error)
  }



})

module.exports = expensesRouter