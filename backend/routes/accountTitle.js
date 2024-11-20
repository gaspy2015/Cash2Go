const express = require('express')
const accountTitleRouter = express.Router()
const builder = require('../builder')

accountTitleRouter.get('/', async (req, res) =>{
    const accountTitle = await builder
    .select({id : 'account_title_id', 
             account_category_id: 'account_category_id' , 
             account_name : 'account_name', 
             account_title: 'account_title', 
             account_code: 'account_code',
             name : 'acc_title'
            })
    .from('view_account_title')
    res.status(200).json(accountTitle)
  })

accountTitleRouter.get('/read/:id', async (req, res) =>{
  const id = req.params.id;
  const accountTitle = await builder
  .select({id : 'account_title_id', 
            account_category_id: 'account_category_id', 
            account_name : 'account_name', 
            account_title: 'account_title', 
            account_code: 'account_code'})
  .from('view_account_title')
  .where('account_title_id', id)
  res.status(200).json(accountTitle)
})

accountTitleRouter.post('/new', async (req, res) => {
  try {
    const id = await builder('account_titletbl').insert({
      account_category_id: req.body.accountTitle.account_category_id,
      account_title: req.body.accountTitle.account_title,
      account_code: req.body.accountTitle.account_code
    }, ['account_title_id']);

    res.status(200).json({ id: id[0], message: 'Account Title added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

accountTitleRouter.put('/edit/:id', async (req, res) => {
  try {
    const id = req.params.id;

    const update = await builder('account_titletbl')
      .where('account_title_id', id)
      .update({
      account_category_id: req.body.accountTitle.account_category_id,
      account_title: req.body.accountTitle.account_title,
      account_code: req.body.accountTitle.account_code
      });

    if (update > 0) {
      res.status(200).json({ message: 'Account Title updated successfully' });
    } else {
      res.status(404).json({ error: 'Account Title not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

accountTitleRouter.delete('/delete/:id', async (req, res) => {
  try {
    const id = req.params.id;

    const deletedCount = await builder('account_titletbl')
      .where('account_title_id', id)
      .del();

    if (deletedCount > 0) {
      res.status(200).json({ message: 'Account Title deleted successfully' });
    } else {
      res.status(404).json({ error: 'Account Title not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

accountTitleRouter.get('/expenses', async (req, res) => {
  try {
    const expenses = await builder('account_titletbl').select({ id: 'account_title_id', name : 'account_title'})
    res.status(200).json(expenses)
  } catch (error) {
    res.status(500).json({success : false})
  }
})

  module.exports = accountTitleRouter