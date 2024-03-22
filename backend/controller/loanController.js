const builder = require('../builder')

async function getLoanList (req, res) {
  
  const search = req.query.search ? req.query.search : ''

  const loans = await builder.select(
    'loan_header_id',
    'pn_number',
    'customername',
    'cfname',
    'cmname',
    'clname',
    'bank_name',
    'loancategory',
    'loanfacility',
    'principal_amount',
    'total_interest',
    'date_granted',
    'status_code',
    'term_type',
    'term'
  )
  .from('view_loan_header').whereILike('customername', `%${search}%`).orWhereILike('pn_number', `%${search}%`)
  
  if(loans <= 0) return

  // const item = query[0]

  // const lastname = item.clname.split(',')
  // const firstName = item.cfname === '0' ? '' :  `, ${item.cfname}`
  // const extName = lastname[1] ? lastname[1] : ''
  // const midInitial = item.cmname === '0' ? '' : ` ${item.cmname}`
  
  // const fullname = lastname[0] + firstName + midInitial + extName
  
  // const voucherInfo = {
  //   details : details,
  //   borrower : fullname.trim(),
  //   date : new Date().toISOString().split('T')[0],
  //   voucherNumber : item.voucher_number
  // }
  
  const loanMap = loans.map((v) =>{
    const item = v

    const lastname = item.clname.split(',')
    const firstName = item.cfname === '' ? '' :  `, ${item.cfname}`
    const extName = lastname[1] ? lastname[1] : ''
    const midInitial = item.cmname === '' ? '' : ` ${item.cmname}`
    
    const fullname = lastname[0] + firstName + midInitial + extName
    
    let term = v.term
    
    if(v.term_type) {
      term = `${v.term} ${v.term_type}`
    } 


    return {
      ...v, name : fullname.trim(),
      loan_term : term
    }

  })

  // const loanMap = loans.map((v) => {
  //   return {
  //     ...v, name : {
  //       fName : v.cfname,
  //       lName : v.clname,
  //       mName : v.cmname
  //     }
  //   }
  // })
  // console.log(loanMap)
  res.status(200).json(loanMap)
}

async function getLoan(req, res) {
  const {id} = req.params
  
  const loans = await builder.select(
    'loan_detail_id',
    'check_date',
    'monthly_principal',
    'monthly_interest',
    'monthly_amortization',
    'description',
    'bank_name',
    'check_number',
    'loan_header_id',
    'check_date'
  ).from('view_detail_payment ').where('loan_header_id', '=', id)
  
  const updatedLoan = loans.map((item) => ({
    ...item,
    description: item.description || 'UNSETTLED',
  }));

  res.status(200).send(updatedLoan)
}

async function saveLoan(req, res){
}

module.exports = { getLoan, getLoanList, saveLoan }