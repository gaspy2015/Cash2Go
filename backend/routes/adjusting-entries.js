const express = require('express')
const adjustingEntriesRouter = express.Router()
const builder = require('../builder')

const incrementTicketNumber = (ticket) => {
  const incrementTicketNumber = Number(ticket) + 1
  const slice = ticket.length - String(incrementTicketNumber).length
  const newTicketNumber = ticket.substring(0, slice) + String(incrementTicketNumber)
  return newTicketNumber
}

adjustingEntriesRouter.get('/', async (req, res) => {
  try {
    const getAdjustingEntries = await builder('adjusting_entries_header').select('id', 'ticket_number', 'borrower_name', 
      builder.raw(`DATE_FORMAT(date, '%m-%d-%Y') as date`),
      'checked_by', 'prepared_by', 'approved_by' )
    res.status(200).json(getAdjustingEntries)
  } catch (error) {
    console.log(error)
    res.status(500).end()
  }

})

adjustingEntriesRouter.get('/ticket-number', async (req, res) => {
  try {
    const getTicketNumber = await builder('adjusting_entries_header').select(builder.raw(`IFNULL(MAX(ticket_number), '00000') as ticket_number`)).first()
    const newTicketNumber = incrementTicketNumber(getTicketNumber.ticket_number)
    res.status(200).json({ticket_number : newTicketNumber})
  } catch (error) {
    console.log(error)
    res.status(500).end()
  }
})

adjustingEntriesRouter.post('/', (req, res) => {
  const {header, details} = req.body
  // return console.log(header)
  try {
    builder.transaction(async (tx) => {
      const getTicketNumber = await tx('adjusting_entries_header').select(tx.raw(`IFNULL(MAX(ticket_number), '00000') as ticket_number`)).first()
      const newTicketNumber = incrementTicketNumber(getTicketNumber.ticket_number)
      const formatAdjustingHeader = {...header, ticket_number : newTicketNumber, explaination : header.explaination.toUpperCase()}
      const [insertedEntryId] = await tx('adjusting_entries_header').insert(formatAdjustingHeader)
      // console.log(insertedEntries)
      const formatWithId = details.map(v => ({...v, adjusting_header_id: insertedEntryId}))
      
      await tx('adjusting_entries').insert(formatWithId)

      res.status(200).end()
    })

  } catch (error) { 
    console.log(error)
    res.status(500).end()
  }
})

const getAdjustingEntryHeader  = async (id) => {
  const result = await builder('adjusting_entries_header').select('ticket_number', 'borrower_name as borrower', 'explaination',
    builder.raw(`DATE_FORMAT(date, '%m-%d-%Y') as date`),
    'prepared_by', 'checked_by', 'approved_by').where('id', id).first()
  return result
}

const getAdjustingEntriesDetails = async (id) => {
  const result = await builder('adjusting_entries').select('account_title as title', 'credit', 'debit').innerJoin('account_titletbl', 'account_titletbl.account_title_id', 'adjusting_entries.account_title_id' ).where('adjusting_header_id', id)
  return result
}

adjustingEntriesRouter.get('/:id', async(req, res) => {
  const {id} = req.params
  try {
    const [header, details] = await Promise.all([getAdjustingEntryHeader(id), getAdjustingEntriesDetails(id)])
    const formatData = {...header, details : details}
    res.status(200).json(formatData)
  } catch (error) {
    res.status(500).end()
  }
})
module.exports = adjustingEntriesRouter