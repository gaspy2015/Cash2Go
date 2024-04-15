const express = require('express')
const loanRouter = express.Router()
const builder = require('../builder')
const {getLoanList, getLoan, saveLoan} = require('../controller/loanController')

const LoanStatus = {
  RENEWED : 'Renewed',
  RESTRUCTURED : 'Restructured',
  ONGOING : 'On Going',
  LOANRENEWAL: 'Loan Renewal'
}

async function createPnNumber(req){

  const qCategoryCode = await builder.select({ code : 'code'}).from('loan_categorytbl').where('loan_category_id', req.loan_category_id)
  const qFacilityCode = await builder.select({ code : 'code'}).from('loan_facilitytbl').where('loan_facility_id', req.loan_facility_id)
  const qCustomerPnNumber = await builder.select({id : 'pn_number'}).from('loan_headertbl').where('customer_id', req.customer_id)

  const categoryCode = qCategoryCode[0].code + qFacilityCode[0].code
  let min = 0

  if(qCustomerPnNumber.length > 0){
    for (const PN of qCustomerPnNumber) {
      const arr = PN.id.split('-')
      if(arr[0] === categoryCode){
        min = min < Number(arr[1]) ? Number(arr[1]) : min
      }
    }
  }
  
  const count = String(min + 1)
  const id = '0000'.slice(count.length) + count
  const year = new Date().getFullYear();

  return `${categoryCode}-${id}-${req.customer_id}-${year}`
}

loanRouter.get('/', getLoanList)

const convertEmpty = (name) => name !== '' ? name : ''

loanRouter.get('/voucher/:id', async (req, res) =>{
  
  const {id} = req.params
  
  const query = await builder.select('*').from('view_voucher').where('loan_header_id', id)

  if(query.length <= 0) {
    return res.status(400).send()
  }
  
  const details = query.map((v) => {
    return {
      name : v.acc_title,
      title : v.account_title,
      credit : v.credit_amount, 
      debit : v.debit_amount
    }
  })
  
  const item = query[0]

  const lastname = item.clname.split(',')

  const firstName = convertEmpty(item.cfname) 
  const extName = lastname[1] ? lastname[1] : ''
  const midInitial = convertEmpty(item.cmname)
  
  const fullname = `${lastname[0]}, ${firstName}  ${midInitial} ${extName}`
  
  const voucherInfo = {
    details : details,
    prepared_by : item.prepared_by,
    approved_by : item.approved_by,
    checked_by : item.checked_by,
    check_details : `${item.bank_name}-${item.check_number}`,
    check_date : item.check_date,
    borrower : fullname.trim(),
    date : new Date().toISOString().split('T')[0],
    voucherNumber : item.voucher_number
  }

  res.status(200).json(voucherInfo)
})

const formatName = (name) =>  {
  
  const lastName = name.clname.split(',')
  const firstName = name.cfname === '' ? '' : `, ${name.cfname}`
  const middleName = name.cmname === '' ? '' : ` ${name.cmname}`
  const extName = lastName[1] ? lastName[1] : ''
  const fullname = lastName[0] + firstName + middleName + extName
  return fullname;

}

loanRouter.get('/renew/:id', async (req, res) => {

  const renewLoan = await builder('view_loan_renew').select('*').where('loan_header_id', req.params.id).first()

  const fullname = formatName(renewLoan)

  const format = {
    loan_header_id: renewLoan.loan_header_id, 
    customer_id : renewLoan.customer_id,
    PrincipalBalance : Number(renewLoan.PrincipalBalance),
    PenaltyBalance :  Number(renewLoan.PenaltyBalance),
    InterestBalance: Number(renewLoan.InterestBalance),
    Balance : Number(renewLoan.Balance),
    customer_name : fullname
  }
  
  res.status(200).json(format)
})

loanRouter.post('/renew', async (req, res) => {

  const pnNumber = await createPnNumber(req.body)

  const {loan_details, voucher, deduction } = req.body
  
  const totalInterest = loan_details.reduce((acc, cur) => acc + Number(cur.interest), 0)

  try {

    await builder.transaction(async (t) => {
      // update old loan 
      await t('loan_headertbl').where({ loan_header_id : req.body.loan_header_id}).update({status_code : LoanStatus.RENEWED}, ['loan_header_id'])
      // insert new loan
      const loanHeaderId = await t('loan_headertbl').insert({
        pn_number : pnNumber,
        check_number :  req.body.check_number,
        term_type : req.body.term_type,
        check_date : req.body.check_date,
        prepared_by : req.body.prepared_by,
        approved_by : req.body.approved_by,
        checked_by : req.body.checked_by,
        customer_id : req.body.customer_id,
        transaction_date : req.body.transaction_date,
        bank_account_id : Number(req.body.bank_account_id),
        collateral_id : req.body.collateral_id,
        loan_category_id : req.body.loan_category_id,
        loan_facility_id : req.body.loan_facility_id,
        principal_amount : Number(req.body.principal_amount),
        interest_rate : Number(req.body.interest_rate),
        date_granted : req.body.date_granted,
        check_issued_name : req.body.check_issued_name,
        voucher_number : req.body.voucher_number,
        total_interest : totalInterest,
        term : loan_details.length, 
        status_code : LoanStatus.ONGOING,
        renewal_id : req.body.loan_header_id,
        renewal_amount : req.body.Balance
      }, ['loan_header_id'] )

      const loanDetailsMap = loan_details.map(v => ({ 
          loan_header_id : loanHeaderId[0],
          check_date : v.dueDate.split('T')[0],
          check_number : Number(v.checkNumber),
          bank_account_id : Number(v.bank_account_id),
          monthly_amortization : Number(v.amortization),
          monthly_interest : Number(v.interest),
          monthly_principal : Number(v.principal),
          accumulated_penalty : 0
      }))

      await t('loan_detail').insert(loanDetailsMap)

      if(deduction.length > 0) {
        await t('loan_deduction_historytbl').insert(
          deduction.map((v) => ({
            loan_deduction_id : v.id,
            loan_header_id : loanHeaderId[0],
            amount : v.amount
        })))
      }
      
      await t('vouchertbl').insert(
        voucher.map((v) => ({
          account_title_id : +v.id,
          debit_amount : +v.debit,
          credit_amount : +v.credit,
          loan_header_id : loanHeaderId[0]
        })
      ))

      res.status(200).json({
        renewal_id : req.body.loan_header_id,
        loan : {
          loan_header_id : loanHeaderId[0],
          date_granted : req.body.transaction_date,
          name : req.body.customer_name,
          pn_number : pnNumber,
          principal_amount : req.body.principal_amount,
          total_interest : totalInterest,
          bank_name : req.body.bank_name,
          loancategory : req.body.loan_category,
          loanfacility : req.body.loan_facility,
          loan_term : `${loan_details.length} ${req.body.term_type}`,
          status_code : LoanStatus.ONGOING,
        }
      })
    })

  }catch(e) {
    console.log(e)
  }
})


loanRouter.get('/recalculate/:id', async (req, res) => {
  try {
    const [header, col] = await builder.raw(`
    select 
      v_h.loan_header_id,
      v_h.customer_id, v_h.cfname, v_h.cmname, clname,
      h.bank_account_id, v_h.bank_name, 
      h.collateral_id, v_h.collateral, 
      h.loan_facility_id, v_h.loanfacility as loan_facility,
      h.loan_category_id, v_h.loancategory as loan_category, 
      h.check_number, h.check_date, h.check_issued_name,
      p.PrincipalBalance, p.PenaltyBalance, p.InterestBalance, p.Balance
    from view_loan_header as v_h 
    inner join loan_headertbl as h 
      on h.loan_header_id = v_h.loan_header_id
    inner join new_payment as p 
      on v_h.loan_header_id = p.loan_header_id 
    where v_h.loan_header_id = ?`,
    [ Number(req.params.id) ])
    const fullname = formatName(header[0])

    res.send({...header[0], customer_name : fullname})
  } catch (error) {
    console.log(error)
  }
})

loanRouter.post('/recalculate', async (req, res) => {
  // console.log(pnNumber)
  const {loan_details, voucher, deduction } = req.body

  const pnNumber =  await createPnNumber(req.body)

  const totalInterest = loan_details.reduce((acc, cur) => acc + Number(cur.interest), 0)

  try {
    await builder.transaction(async (t) => { 
      
      await t('loan_headertbl').where({ loan_header_id : req.body.loan_header_id}).update({status_code : LoanStatus.RESTRUCTURED}, ['loan_header_id'])
  
      const loanHeaderId = await t('loan_headertbl').insert({
        pn_number : pnNumber,
        check_number :  req.body.check_number,
        term_type : req.body.term_type,
        check_date : req.body.check_date,
        prepared_by : req.body.prepared_by,
        approved_by : req.body.approved_by,
        checked_by : req.body.checked_by,
        customer_id : req.body.customer_id,
        transaction_date : req.body.transaction_date,
        bank_account_id : Number(req.body.bank_account_id),
        collateral_id : req.body.collateral_id,
        loan_category_id : req.body.loan_category_id,
        loan_facility_id : req.body.loan_facility_id,
        principal_amount : Number(req.body.principal_amount),
        interest_rate : Number(req.body.interest_rate),
        date_granted : req.body.date_granted,
        check_issued_name : req.body.check_issued_name,
        voucher_number : req.body.voucher_number,
        total_interest : totalInterest,
        term : loan_details.length, 
        status_code : LoanStatus.ONGOING,
        renewal_id : req.body.loan_header_id,
        renewal_amount : req.body.Balance
      }, ['loan_header_id'] )
      
      const loanDetailsMap = loan_details.map(v => ({ 
        loan_header_id : loanHeaderId[0],
        check_date : v.dueDate.split('T')[0],
        check_number : Number(v.checkNumber),
        bank_account_id : Number(v.bank_account_id),
        monthly_amortization : Number(v.amortization),
        monthly_interest : Number(v.interest),
        monthly_principal : Number(v.principal),
        accumulated_penalty : 0
      }))

      await t('loan_detail').insert(loanDetailsMap)
      
      await t('vouchertbl').insert(
        voucher.map((v) => ({
          account_title_id : +v.id,
          debit_amount : +v.debit,
          credit_amount : +v.credit,
          loan_header_id : loanHeaderId[0]
        })
      ))
      console.log('update')
      const response = {
        renewal_id : req.body.loan_header_id,
        loan : {
          loan_header_id : loanHeaderId[0],
          date_granted : req.body.transaction_date,
          name : req.body.customer_name,
          pn_number : pnNumber,
          principal_amount : req.body.principal_amount,
          total_interest : totalInterest,
          bank_name : req.body.bank_name,
          loancategory : req.body.loan_category,
          loanfacility : req.body.loan_facility,
          loan_term : `${loan_details.length} ${req.body.term_type}`,
          status_code : LoanStatus.ONGOING,
        }
      }
      res.status(200).json(response)
    })
  } catch (error) {
    console.log(`ERROR: ${error}`)
  }
})


loanRouter.post('/', async (req, res)=>{
  
  const {voucher, deduction, loan_details} = req.body

  const pnNumber = await createPnNumber(req.body)

  const totalInterest = loan_details.reduce((acc, cur) => acc + Number(cur.interest), 0)

  await builder.transaction(async t =>{
    
    const id = await builder('loan_headertbl').insert({
      pn_number : pnNumber,
      check_number :  req.body.check_number,
      term_type : req.body.term_type,
      check_date : req.body.check_date,
      prepared_by : req.body.prepared_by,
      approved_by : req.body.approved_by,
      checked_by : req.body.checked_by,
      customer_id : req.body.customer_id,
      transaction_date : req.body.transaction_date,
      bank_account_id : Number(req.body.bank_account_id),
      collateral_id : req.body.collateral_id,
      loan_category_id : req.body.loan_category_id,
      loan_facility_id : req.body.loan_facility_id,
      principal_amount : Number(req.body.principal_amount),
      interest_rate : Number(req.body.interest_rate),
      date_granted : req.body.date_granted,
      check_issued_name : req.body.check_issued_name,
      voucher_number : req.body.voucher_number,
      total_interest : totalInterest,
      term : loan_details.length, 
      status_code : LoanStatus.ONGOING,
      renewal_id : 0,
      renewal_amount : 0
    }, '*').transacting(t)

    
    const loanDetailsMap = loan_details.map(v => { 
      return{
        loan_header_id : id[0],
        check_date : v.dueDate.split('T')[0],
        check_number : Number(v.checkNumber),
        bank_account_id : Number(v.bank_account_id),
        monthly_amortization : Number(v.amortization),
        monthly_interest : Number(v.interest),
        monthly_principal : Number(v.principal),
        accumulated_penalty : 0
      }
    })

    await builder.insert(loanDetailsMap).into('loan_detail').transacting(t)
    //TODO : refactor 
    //TODO handle deduction id in client
    const deductionFormat = deduction.map((v) =>({
      loan_deduction_id : v.id,
      loan_header_id : id[0],
      amount : v.amount
    }))

    if(deductionFormat.length > 0) {
      await builder.insert(deductionFormat).into('loan_deduction_historytbl').transacting(t)
    }

    const mapVoucher = voucher.map((v) => {
      return {
        account_title_id : Number(v.id),
        debit_amount : Number(v.debit),
        credit_amount : Number(v.credit),
        loan_header_id : id[0],
      }
    })

    const voucherId = await builder.insert(mapVoucher).into('vouchertbl').transacting(t)
    
    res.status(200).json({
      loan_header_id : id[0],
      date_granted : req.body.date_granted,
      name : req.body.customer_name,
      pn_number : pnNumber,
      principal_amount : Number(req.body.principal_amount),
      total_interest : totalInterest,
      bank_name : req.body.bank_name ,
      loancategory : req.body.loan_category,
      loanfacility : req.body.loan_facility,
      loan_term : `${loan_details.length} ${req.body.term_type}`,
      status_code : LoanStatus.ONGOING,
    })   
})

})


loanRouter.put('/details/:id', async (req, res) => {
  const {id} = req.params
  const {loan_detail_id, check_number, bank_id} = req.body
  
  try {
    const update = await builder('loan_detail').where({
      loan_header_id : id,
      loan_detail_id : loan_detail_id
    }).update({
      bank_account_id : bank_id,
      check_number : check_number
    })
    return res.status(200).send()
  } catch (error) {
    return res.status(500).send(error)
  }
})

loanRouter.get('/category', async (req, res)=>{
  const banks = await builder.select({id : 'loan_category_id', name : 'description', code : 'code'}).from('loan_categorytbl')
  res.status(200).json(banks)
  
})

loanRouter.get('/facility', async (req, res)=>{
  const banks = await builder.select({id : 'loan_facility_id', name : 'description', code : 'code'}).from('loan_facilitytbl')
  res.status(200).json(banks)
})

loanRouter.get('/collateral', async (req, res)=>{
  const col = await builder.select({id : 'collateral_id', name : 'description'}).from('collateraltbl')
  res.status(200).json(col)
})

loanRouter.get('/penalty', async (req, res) =>{
  const penalty = await builder.select({id : 'penalty_id', penaltyType : 'penalty_type'}).from('penaltytbl')
  res.status(200).json(penalty)
})





loanRouter.get('/:id', getLoan)

module.exports = loanRouter