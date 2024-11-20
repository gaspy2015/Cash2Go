const formatName = (name) => {
  
  const lastName = name.clname.split(',')
  const firstName = name.cfname === '' ? '' : `, ${name.cfname}`
  const middleName = name.cmname === '' ? '' : ` ${name.cmname}`
  const extName = lastName[1] ? lastName[1] : ''
  const fullname = lastName[0] + firstName + middleName + extName
  return fullname;

}

module.exports = { formatName }