select 
	v_h.loan_header_id,
    v_h.customer_id, v_h.cfname, v_h.cmname, clname,
    h.bank_account_id, v_h.bank_name, 
    h.collateral_id, v_h.collateral, 
    h.loan_facility_id, v_h.loanfacility as loan_facility,
    h.loan_category_id, v_h.loancategory as loan_category, 
    h.check_number, h.check_date,
    p.PrincipalBalance, p.PenaltyBalance, p.InterestBalance, p.Balance
 from view_loan_header as v_h 
 inner join loan_headertbl as h 
	on h.loan_header_id = v_h.loan_header_id
 inner join new_payment as p 
	on v_h.loan_header_id = p.loan_header_id 
 where v_h.loan_header_id = 44