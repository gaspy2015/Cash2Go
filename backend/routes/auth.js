const express = require('express')
const auth = express.Router()
const jwt = require('jsonwebtoken')
const builder = require('../builder')
const secretKey = 'eRHfBiAs2s3y4+PgytlBQeU0NxIFOCzc+QBL2YmGvIQ='
const bcrypt = require('bcrypt')

auth.post('/login',async (req, res) => {
  const {username, password} = req.body
  // if(req.cookies['token']) {res.cookie('to')}
  try {
    const user = await builder('employeetbl').select(
      {id : 'employee_id'},
      builder.raw(`CONCAT_WS(', ',fname, lname) as full_name`), 
      'username',
      'password',
      'type'
    )
    .where('username', username).first()
    
    if(!user)  {
      return console.log('invalid credentials')
    }

    const match =  await bcrypt.compare(password, user.password)
    if(!match) { return console.log('invalid credentials')}

    const token = await genToken({id : user.id, username : user.username})
    res.cookie('token', token, { httpOnly : true })

    res.json({full_name : user.full_name, account_type : user.type, username : user.username})

  } catch (error) {
    console.log(error)
  }
  
  
})

function genToken(payload) {
  return new Promise((res, rej) => {
    jwt.sign(payload, secretKey, (err, token) => {
      if(err) { rej(err) }
      res(token)
    })
  })
}

const isMatchPassword = () => {
  b
}

module.exports = auth