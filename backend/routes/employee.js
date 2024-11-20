const express = require('express')
const employeeRouter = express.Router()
const builder = require('../builder')


employeeRouter.get('/', async (req, res) => {
   const employees = await builder('employeetbl').select({id: 'employee_id', lname: 'lname', fname: 'fname', mname: 'mname', role: 'role'})
   const mapEmployees = employees.map((v) => {
    const fullName = `${v.lname}, ${v.fname} ${v.mname}.`
    return {
      ...v, 
      name : fullName
    }
   })
   res.status(200).json(mapEmployees)
})

// module.exports = employeeRouter

// employeeRouter.get('/', async (req, res) =>{
//     const employee = await builder.select({id : 'employee_id', fname : 'fname', mname : 'mname', lname : 'lname', role : 'role'}).from('employeetbl')
//     res.status(200).json(employee)
//   })

  employeeRouter.get('/read/:id', async (req, res) =>{
    const id = req.params.id;
    const employee = await builder.select({id : 'employee_id', fname : 'fname', mname : 'mname', lname : 'lname', role : 'role'}).from('employeetbl')
    .where('employee_id', id)
    res.status(200).json(employee)
  })

  employeeRouter.post('/new', async (req, res) => {
    try {
      const id = await builder('employeetbl').insert({
        fname: req.body.fname,
        mname: req.body.mname,
        lname: req.body.lname,
        role: req.body.role
      }, ['employee_id']);
  
      res.status(200).json({ id: id[0], message: 'Employee added successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  employeeRouter.put('/edit/:id', async (req, res) => {
    try {
      const id = req.params.id;
  
      const update = await builder('employeetbl')
        .where('employee_id', id)
        .update({
            fname: req.body.fname,
            mname: req.body.mname,
            lname: req.body.lname,
            role: req.body.role
        });
  
      if (update > 0) {
        res.status(200).json({ message: 'Employee updated successfully' });
      } else {
        res.status(404).json({ error: 'Employee not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  employeeRouter.delete('/delete/:id', async (req, res) => {
    try {
      const id = req.params.id;
  
      const deletedCount = await builder('employeetbl')
        .where('employee_id', id)
        .del();
  
      if (deletedCount > 0) {
        res.status(200).json({ message: 'Employee deleted successfully' });
      } else {
        res.status(404).json({ error: 'Employee not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  

  module.exports = employeeRouter
