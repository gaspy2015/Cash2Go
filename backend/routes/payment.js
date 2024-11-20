const express = require("express");
const paymentRouter = express.Router();
const builder = require("../builder");
const multer  = require('multer')
const path = require('path');
const  supabaseClient  = require("../supabase/supabase");

const upload = multer()

paymentRouter.get("/search", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;

  const offset = (page - 1) * pageSize;
  // console.log('offset',   req.query.page)
  const input = req.query.search ? req.query.search : "";
  const category = req.query.category
  // return console.log(input, cat)

  try {
    if(category === 'name') {
      const [results, totalCount] = await Promise.all([
          builder.select('*').from('new_payment').where("customername", "like", `%${input.trim()}%`),
          // second
          builder
          .count("* as count")
          .from({ c: "new_payment" })
          .modify((queryBuilder) => {
            if (input.trim() !== "") {
              queryBuilder.where("customername", "like", `%${input.trim()}%`); // Filter by customer name
            }
          })
          .first(),
      ]);
      res.status(200).json({
        data: results,
        page: page + 1,
        totalCount: totalCount.count,
      });
      return 
    }
    
    const [results, totalCount] = await Promise.all([
      builder('view_loan_detail').select(
        'new_payment.loan_header_id',
        'new_payment.pn_number',
        'customername',
        'loancategory',
        'loanfacility',
        'principal_amount',
        'total_interest',
        'date_granted',
        'TotalPrincipalPayment',
        'TotalInterestPayment',
        'TotalPenaltyPayment',
        'TotalPayment',
        'PrincipalBalance',
        'PenaltyBalance',
        'InterestBalance',
        'Balance'
      ).where('check_number', input.trim()).innerJoin('new_payment', 'view_loan_detail.loan_header_id', 'new_payment.loan_header_id'),
      // second
      builder
      .count("* as count")
      .from({ c: "new_payment" })
      .modify((queryBuilder) => {
        if (input.trim() !== "") {
          queryBuilder.where("customername", "like", `%${input.trim()}%`); // Filter by customer name
        }
      })
      .first(),
      ]);
      res.status(200).json({
        data: results,
        page: page + 1,
        totalCount: totalCount.count,
      });
      return

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

const formatName = (item) => {
  const lastName = item['clname'].split(',')
  const firstName = item['cfname'] ? `, ${item['cfname']}` : ''
  const middleName = item['cmname'] ? ` ${item['cmname']}` : ''
  const extName = lastName[1] ? `${lastName[1]}`: ''

  return lastName + firstName + middleName + extName
}

paymentRouter.get('/', async (req, res) => {
  
  const {date, search, } = req.query
  console.log(req.query)
  // return
  const fields = [
    {id : 'p_h.payment_history_id'},
    'p.loan_detail_id',
    'payment_principal',
    'payment_interest',
    'payment_penalty',
    'p_h.payment_date',
    'p.payment_type', 
    'payment_receipt',
    'p.bank',
    {check_number : 'p.checkno'},
    'p.payment_amount',
    'p.remarks',
    'p.payment_type',
    builder.raw('p_h.check_date as check_date'),
    //-- loan header details
    'pn_number',
    // customer name
    'cfname',
    'cmname',
    'clname',
  ]
  // let payments;
  // if(search){
  const payments = await builder(builder.raw('payment_historytbl as p_h'))
    .select(
      fields
    )
    .innerJoin(builder.raw('paymenttbl as p'), 'p.loan_detail_id','p_h.loan_detail_id' )
    .innerJoin(builder.raw('loan_detail as l_d'), 'p_h.loan_detail_id', "l_d.loan_detail_id" )
    .innerJoin(builder.raw('loan_headertbl as l_h'), 'l_h.loan_header_id', 'l_d.loan_header_id')
    .innerJoin(builder.raw('customertbl as c'), 'c.customerid', 'l_h.customer_id')
    .modify((sub) => {
      if(req.query['customer_name'])
        sub.whereILike('clname', `%${req.query['customer_name'].trim()}%`)
         .orWhereILike('cfname', `%${req.query['customer_name'].trim()}%`);
      else if (req.query['pn_number']) 
        sub.whereILike('pn_number', `%${req.query['pn_number'].trim()}%`)
      else if (req.query['check_number'])
        sub.whereILike(builder.raw('p.checkno'), `%${req.query['check_number'].trim()}%`)
      else 
        sub.havingBetween('p_h.payment_date', [date.from , date.to])
    })
    
  const result = payments.map((payment) => {
    // if online or cash no check date
    if(payment.payment_type == 'CASH' || payment.payment_type == 'ONLINE'){
      return {
        ...payment, 
        fullName : formatName(payment),
        check_date : null
      }
    }
    return {
      ...payment, 
      fullName : formatName(payment)
    }
  })
  // console.log(result)
  res.json({data : result})
})

async function supabaseUpload(file) {
  if(file){
    try {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      const upload = await supabaseClient.storage.from('Attachment').upload(`${uniqueSuffix}${path.extname(file.originalname)}`, file.buffer, {
        contentType: file.mimetype,
      })
      return upload.data.fullPath

    } catch (error) {
      console.log(error)
    }
  }else{
    return ''
  }
}

paymentRouter.post('/', upload.single('attachment'), async (req, res) => {
  // get payment status 
  const data = req.body
  const {principal_payment, interest_payment, penalty_amount} = data 
  let statusId = 0;
  
  const formatStatus = (statusList) => {
    const status = {}
    for (const item of statusList) {
      const formatDescription = item.description.toLowerCase().split(' ')
      status[formatDescription.join('_')] = item.payment_status_id
    }
    return status
  }
  
  try {
    const fileName = await supabaseUpload(req.file)
    
    const paymentStatus = await builder('payment_status').select('*')
    
    const status = formatStatus(paymentStatus)
   
    const {monthly_principal, monthly_interest, accumulated_penalty} = await builder('loan_detail').select('monthly_principal', 'monthly_interest').where('loan_detail_id', data.loan_detail_id).first();
    
    const total =  principal_payment + interest_payment + penalty_amount
    // status_id
    if (Number(monthly_principal) == Number(principal_payment) && Number(interest_payment) == Number(monthly_interest)) 
      statusId = status['paid'];
    else 
      statusId = status['partialy_paid'];
    
    // payment_date
    const processDate = new Date().toISOString().split('T')[0]
  
    const { count } = await builder('paymenttbl').count({ count : 'loan_detail_id'}).where('loan_detail_id', data.loan_detail_id ).first()

    await builder.transaction( async (t) => {
      // check if partial payment
      
      if(count > 0) {
    
        const partialPaymentInfo = await builder('paymenttbl').select('principal_payment', 'interest_payment', 'penalty_amount').where('loan_detail_id',  data.loan_detail_id).first()
    
        const totalPrincipalPayment = Number(partialPaymentInfo.principal_payment) + principal_payment
        const totalInterestPayment = Number(partialPaymentInfo.interest_payment) + interest_payment

        if(totalPrincipalPayment == monthly_principal && totalInterestPayment == monthly_interest)
          statusId = status['paid'];
        else 
          statusId = status['partialy_paid'];

        await t('paymenttbl').where({loan_detail_id : data.loan_detail_id}).update({
          // loan_detail_id : data.loan_detail_id,
          principal_payment : totalPrincipalPayment,
          interest_payment : totalInterestPayment,
          // payment_amount : totalPrincipalPayment + totalInterestPayment + data.penalty_amount, 
          payment_amount : totalPrincipalPayment + totalInterestPayment + data.penalty_amount, 
          payment_type : data.payment_type,
          penalty_amount : Number(data.penalty_amount),
          payment_status_id : statusId,
          receiptno : data.pr_number,
          OR_no : data.or_number,
          remarks : data.remarks,
          bank : data.bank,
          checkno : data.check_number 
        })

      } else {

        await t('paymenttbl').insert({
          loan_detail_id : data.loan_detail_id,
          principal_payment : Number(data.principal_payment),
          interest_payment : Number(data.interest_payment),
          payment_amount : total, 
          payment_type : data.payment_type,
          penalty_amount : Number(data.penalty_amount),
          payment_status_id : statusId,
          receiptno : data.pr_number,
          OR_no : data.or_number,
          remarks : data.remarks,
          bank : data.bank,
          checkno : data.check_number
        })
      }
      
      const payment_data = () => {
         payment_info = {
          loan_detail_id : data.loan_detail_id,
          payment_principal : principal_payment,
          payment_interest : interest_payment,
          payment_penalty : penalty_amount,
          payment_date : processDate,
          payment_type : data.payment_type,
          payment_receipt : data.pr_number,
          attachment : fileName
          // check_date : data.check_date
        }
        if(data.payment_type.toLowerCase() === 'check') {
          
          return {
            ...payment_info,
            check_date : data.check_date
          }
        }
        return payment_info
      }

      const paymentId = await t('payment_historytbl').insert(payment_data())

      if(data.payment_type.toLowerCase() === 'check'){
        await builder('loan_detail').where({loan_detail_id : data.loan_detail_id}).update({check_number : data.check_number});
      }

      if(data.payment_type.toLowerCase() === 'cash' && data.cash_count) {
        const billCount = data.cash_count.map((v) => ({
          loan_header_id : data.loan_header_id,
          loan_detail_id : data.loan_detail_id,
          bill_type : String(v.denomination),
          bill_count : v.count
        }))
        await t('bill_counttbl').insert(billCount)
      }
      // select p_number and customer name
      const loanInfo = await t(t.raw('loan_headertbl as l_h')).where('loan_header_id', data.loan_header_id).select(
        'pn_number',
        'cfname',
        'cmname',
        'clname',
      ).innerJoin(builder.raw('customertbl as c'), 'c.customerid', 'l_h.customer_id').first()

      res.status(200).json({
        id : paymentId[0],
        payment_date : processDate,
        payment_receipt : data.pr_number,
        fullName : formatName(loanInfo),
        pn_number : loanInfo.pn_number,
        payment_type : data.payment_type,
        bank : data.bank,
        check_number : data.check_number,
        check_date : data.check_date ? data.check_date : null,
        payment_principal : data.principal_payment,
        payment_interest : data.interest_payment,
        payment_penalty : data.penalty_amount,
        remarks : data.remarks
      })

    })

  } catch (error) {
    console.log(error)
  }

  
})

paymentRouter.get('/deductions', async (req, res) => {
  const {date, search} = req.query
  const fields = [
    'd_h.loan_deduction_id',
    'd_h.loan_header_id',
    'amount',
    'pr_number',
    'd_h.process_date',
    'deduction_type',
    // 'l_h.customer_id',
    'l_h.pn_number',
    'cfname',
    'clname',
    'cmname'
  ]

  const deductions = await builder(builder.raw('loan_deduction_historytbl as d_h'))
  .select(fields)
  .innerJoin(builder.raw('loan_deductiontbl as l_d'),'d_h.loan_deduction_id', 'l_d.loan_deduction_id' )
  .innerJoin(builder.raw('loan_headertbl as l_h'), 'l_h.loan_header_id', 'd_h.loan_header_id')
  .innerJoin(builder.raw('customertbl as c'), 'c.customerid', 'l_h.customer_id')
  .modify((sub) => {
    if(req.query['customer_name'])
      sub.whereILike('clname', `%${req.query['customer_name']}%`)
       .orWhereILike('cfname', `%${req.query['customer_name']}%`);
    else if (req.query['pn_number'])
      sub.whereILike('pn_number', `%${req.query['pn_number']}%`)
    else if (req.query['pr_number'])
      sub.whereILike('pr_number', `%${req.query['pr_number']}%`)
    else 
      sub.havingBetween('process_date', [date.from , date.to])
  })
  .where('isCash', true)

  const mapDeduction = new Map()
  
  for (const d of deductions) {

    const regType = d.deduction_type.replace(/[^a-zA-Z ]/g, "");
    
    const type = regType.toLowerCase().split(' ').join('_')

    if(!mapDeduction.has(d.loan_header_id))
      mapDeduction.set(d.loan_header_id, { 
        id : d.loan_header_id, 
        pr_number : d.pr_number,
        [type] : d.amount,
        full_name : formatName(d),
        pn_number : d.pn_number,
        process_date : d.process_date
      });
    else 
      mapDeduction.set(d.loan_header_id, {...mapDeduction.get(d.loan_header_id), [type] : d.amount});
    
  }
  res.send([...mapDeduction.values()])
})


paymentRouter.get("/customer", async (req, res) => {
  try {
    const customers = await builder
      .select({
        id: "customerid",
        fullname: builder.raw(
          "CONCAT_WS(', ', ??, CONCAT(??, ' ', SUBSTRING(??, 1, 1), '.'))",
          ["clname", "cfname", "cmname"]
        ),
      })
      .from({ c: "customertbl" });

    res.status(200).send(customers);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

paymentRouter.get("/read/:id", async (req, res) => {
  const id = req.params.id;
  const payment = await builder
    .select(
         'loan_detail_id'
		    ,'loan_header_id'
        ,'check_date'
        ,'due_date'
        ,'monthly_principal'
        ,'monthly_interest'
        ,'monthly_amortization'
        ,'payment_type'
        ,'principal_payment'
        ,'interest_payment'
        ,'penalty_amount'
        ,'payment_amount'
        ,'Balance'
        ,'running_balance'
        // ,'running_total',
        // 'description'
    )
    .from("new_view_payment_detail") // 
    .where("loan_header_id", id)
    .orderBy('due_date', 'asc')
    
    const updatedLoan = payment.map((item) => {
      return ({
      ...item,
      description: item.description || 'UNSETTLED',
    })});
  res.status(200).json(updatedLoan);
});

paymentRouter.get("/paymentDue/:id", async (req, res) => {
  const id = req.params.id;
  // console.log("ID:", id);
  
  try {
    // Define the subquery for the minimum check_date
    // TODO: add due_date payment
    const minCheckDateSubquery = builder('view_detail_payment')
      .min('due_date')
      .whereRaw('ifnull(payment_status_id, 0) != 1')
      .andWhere('loan_header_id', id)
      .as('min_check_date'); // This names the subquery result for clarity

    // Main query
    const payment = await builder
      .select(
        'loan_detail_id',
        builder.raw('monthly_principal - principal_payment as Principal_Due'),
        builder.raw('monthly_interest - interest_payment as Interest_Due'),
        builder.raw('accumulated_penalty - penalty_amount as Penalty_Due'),
        'customer_fullname',
        'pn_number',
        'due_date',
        'bank_name',
        'check_number'
      )
      .from("view_detail_payment")
      .whereRaw('ifnull(payment_status_id, 0) != 1')
      // Use the subquery within the main query
      .andWhere('due_date', '=', builder.raw(`(${minCheckDateSubquery})`))
      .andWhere('loan_header_id', '=', id);

    // console.log("Query Result:", payment); // Log the query result
    res.status(200).json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

paymentRouter.get('/bank', async (req, res)=>{
  const banks = await builder.select({id : 'bank_account_id', name : 'bank_name'}).from('bank_accounttbl')
  res.status(200).json(banks)
})

module.exports = paymentRouter;
