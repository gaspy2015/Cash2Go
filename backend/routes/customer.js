const express = require('express')
const customerRouter = express.Router()
const builder = require('../builder')

// customerRouter.get('/', async (req, res) =>{
//   const customers = await builder.select({
//     id : 'customerid',
//     f_name : 'cfname',
//     m_name : 'cmname',
//     l_name : 'clname',
//     contactNo : 'contactno',
//     address : 'address',
//     gender : 'gender',
//   }).from({ c : 'customertbl'})

//   res.status(200).send(customers)
// })

// customerRouter.get('/info', async (req, res)=>{
//   const customers = await builder.select('*').from('customertbl')
//   res.status(200).send(customers)
// })
// server-side code (Node.js/Express)

customerRouter.get('/search', async (req, res) =>{
  const {name} = req.query

  const customers = await builder.select({
    id : 'customerid',
    f_name : 'cfname',
    m_name : 'cmname',
    l_name : 'clname',
    contactNo : 'contactno',
    address : 'address',
    gender : 'gender', })
  .from({ c : 'customertbl'}) 
  .whereILike('clname', `%${name}%`)
  .orWhereILike('cfname', `%${name}%`)
  
  const customer = customers.map((customer, index) => {
    const lastName = customer.l_name.split(',')
    const firstName = customer.f_name === '' ? '' : `, ${customer.f_name}`
    const middleName = customer.m_name === '' ? '' : ` ${customer.m_name}`
    const extName = lastName[1] ? `${lastName[1]}` : ''
    const fullName = lastName[0] + firstName + middleName + extName
    
    return {
      ...customer,
      name : fullName.trim()
    }
  })
  
  res.send(customer)
})


customerRouter.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const offset = (page - 1) * pageSize;

  try {
    const totalCount = await builder('items').count('id as total').first();
    const items = await builder
      .select({
        id: 'customerid',
        f_name: 'cfname',
        m_name: 'cmname',
        l_name: 'clname',
        contactNo: 'contactno',
        address: 'address',
        gender: 'gender',
      })
      .from({ c: 'customertbl' })
      .limit(pageSize)
      .offset(offset);

    const response = {
      page,
      pageSize,
      total: totalCount.total,
      totalPages: Math.ceil(totalCount.total / pageSize),
      rows: items,
    };

    res.status(200).json(response);
  } catch (err) {
    res.status(500).send({
      message: 'Error fetching customers',
      error: err,
    });
  }
});




customerRouter.get('/info/:id', async (req, res)=>{
  const {id} = req.params
  const customers = await builder.select('*').from('customertbl').where('customerid', id)
  res.status(200).send(customers[0])
})

customerRouter.post('/', async (req, res)=>{
  const {borrower, spouse} = req.body
  const id = await builder('customertbl').insert({
    // Borrower Info
    cfname : borrower.fName,
    cmname : borrower.mName,
    clname : borrower.lName,
    address : borrower.address,
    contactno : borrower.phoneNum,
    birthdate : borrower.birthdate,
    gender : borrower.gender,
    maritalstatus : borrower.civilStatus,
    // Borrower Spouse Info
    spousefname: spouse.fName,
    spousemname : spouse.mName,
    spouselname : spouse.lName,
    spouseaddress : spouse.address,
    spousebirthdate : spouse.birthdate,
    spousegender : spouse.gender,
    spousemaritalstatus: borrower.civilStatus,
    spousecontactno : spouse.phoneNum
  }, ['customerid'])
  console.log(id)
  res.status(200).json({id : id[0]})

})
customerRouter.put('/', async (req, res)=>{
  const {borrower, spouse, id} = req.body
  //TODO handle error
  const update = await builder('customertbl')
  .where('customerid', id)
  .update({
    // Borrower Info
    cfname : borrower.fName,
    cmname : borrower.mName,
    clname : borrower.lName,
    address : borrower.address,
    contactno : borrower.phoneNum,
    birthdate : borrower.birthdate,
    gender : borrower.gender,
    maritalstatus : borrower.civilStatus,
    // Borrower Spouse Info
    spousefname: spouse.fName,
    spousemname : spouse.mName,
    spouselname : spouse.lName,
    spouseaddress : spouse.address,
    spousebirthdate : spouse.birthdate,
    spousegender : spouse.gender,
    spousemaritalstatus: borrower.civilStatus,
    spousecontactno : spouse.phoneNum
  })
  
  res.status(200).send()
  
})


module.exports = customerRouter