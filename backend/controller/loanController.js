const builder = require('../builder')

async function getLoanList (req, res) {
  // const search = req.query.search ? req.query.search : ''
  if(req.query) { console.log(req.query)}
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
  ).modify((sub) => {
  
    if(req.query['type'] == 'customer_name') {
      return sub.whereILike('customername', `%${req.query['value'].trim()}%`)
    }
  
    if(req.query['type'] == 'pn_number') {
      return sub.whereILike('pn_number', `%${req.query['value'].trim()}%`)
    }
    
    if(req.query['type'] == 'loan_category') {
      return sub.whereILike('loancategory', `%${req.query['value'].trim()}%`)
    }
    
    if(req.query['type'] == 'loan_facility') {
      return sub.whereILike('loanfacility', `%${req.query['value'].trim()}%`)
    }
  
  }).orderBy('date_granted', 'desc')
  .from('view_loan_header')

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
    'check_date',
    'due_date'
  ).from('view_detail_payment').where('loan_header_id', '=', id)
  
  const updatedLoan = loans.map((item) => ({
    ...item,
    description: item.description || 'UNSETTLED',
  }));

  res.status(200).send(updatedLoan)
}

async function saveLoan(req, res){
}

module.exports = { getLoan, getLoanList, saveLoan }