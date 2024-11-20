const express = require('express')
const bankRouter = express.Router()
const builder = require('../builder')

bankRouter.get('/cash2go', async (req, res) => {
  const banks = await builder.select({id : 'bank_account_id', name : 'bank_name', check_location : 'check_location', owner : 'is_owner_bank', bank_branch: 'bank_branch'})
  .from('bank_accounttbl').where('is_owner_bank', 1)
  res.status(200).json(banks)
})

bankRouter.get('/', async (req, res) => {
  const banks = await builder.select({id : 'bank_account_id', name : 'bank_name', check_location : 'check_location', owner : 'is_owner_bank', bank_branch: 'bank_branch'})
  .from('bank_accounttbl')

  res.status(200).json(banks)
})

bankRouter.get('/customers', async (req, res) => {
  const banks = await builder.select({id : 'bank_account_id', name : 'bank_name', check_location : 'check_location', owner : 'is_owner_bank', bank_branch: 'bank_branch'})
  .from('bank_accounttbl')
  .where('is_owner_bank', 0)
  res.status(200).json(banks)
})


bankRouter.get('/read/:id', async (req, res) =>{
  const id = req.params.id;
  
  const deduction = await builder.select({id : 'bank_account_id', name : 'bank_name', check_location: 'check_location', owner : 'is_owner_bank', bank_branch: 'bank_branch'})
                                 .from('bank_accounttbl')
                                 .where('bank_account_id', Number(id))
  res.status(200).json(deduction)
})

bankRouter.post('/new', async (req, res) => {
  const {param} = req.body

  try {
    const id = await builder('bank_accounttbl').insert({
      bank_name: req.body.name,
      check_location: req.body.check_location,
      bank_branch : req.body.bank_branch,
      is_owner_bank : param === 'customers' ? false : true,
    }, ['bank_account_id']);

    res.status(200).json({ id: id[0], message: 'Bank added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

bankRouter.put('/edit/:id', async (req, res) => {
  try {
    const id = req.params.id;

    const update = await builder('bank_accounttbl')
      .where('bank_account_id', id)
      .update({
          bank_name: req.body.name,
          check_location: req.body.check_location,
          type: req.body.type,
          bank_branch : req.body.bank_branch,
          // is_owner_bank : req.body.owner
      });

    if (update > 0) {
      res.status(200).json({ message: 'Bank updated successfully' });
    } else {
      res.status(404).json({ error: 'Bank not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

bankRouter.delete('/delete/:id', async (req, res) => {
  try {
    const id = req.params.id;

    const deletedCount = await builder('bank_accounttbl')
      .where('bank_account_id', id)
      .del();

    if (deletedCount > 0) {
      res.status(200).json({ message: 'Bank deleted successfully' });
    } else {
      res.status(404).json({ error: 'Bank not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




module.exports = bankRouter