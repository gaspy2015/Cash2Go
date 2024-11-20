const express = require('express')
const facilityRouter = express.Router()
const builder = require('../builder')

facilityRouter.get('/', async (req, res)=>{
    const banks = await builder.select({id : 'loan_facility_id', name : 'description', code : 'code'}).from('loan_facilitytbl')
    res.status(200).json(banks)
  })

  facilityRouter.get('/read/:id', async (req, res) =>{
    const id = req.params.id;
    const deduction = await builder.select({id : 'loan_facility_id', name : 'description', code: 'code', rediscounting : 'is_rediscount'})
                                   .from('loan_facilitytbl')
                                   .where('loan_facility_id', id)
    res.status(200).json(deduction)
  })

  facilityRouter.post('/new', async (req, res) => {
    try {
      const id = await builder('loan_facilitytbl').insert({
        description: req.body.name,
        code: req.body.code,
        is_rediscount : req.body.rediscounting
      }, ['loan_facility_id']);
  
      res.status(200).json({ id: id[0], message: 'Facility added successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  facilityRouter.put('/edit/:id', async (req, res) => {
    try {
      const id = req.params.id;
  
      const update = await builder('loan_facilitytbl')
        .where('loan_facility_id', id)
        .update({
            description: req.body.name,
            code: req.body.code,
            is_rediscount : req.body.rediscounting
        });
  
      if (update > 0) {
        res.status(200).json({ message: 'Facility updated successfully' });
      } else {
        res.status(404).json({ error: 'Facility not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  facilityRouter.delete('/delete/:id', async (req, res) => {
    try {
      const id = req.params.id;
  
      const deletedCount = await builder('loan_facilitytbl')
        .where('loan_facility_id', id)
        .del();
  
      if (deletedCount > 0) {
        res.status(200).json({ message: 'Facility deleted successfully' });
      } else {
        res.status(404).json({ error: 'Deduction not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  

  module.exports = facilityRouter