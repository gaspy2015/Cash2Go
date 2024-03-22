const express = require("express");
const paymentRouter = express.Router();
const builder = require("../builder");

paymentRouter.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const offset = (page - 1) * pageSize;
  const search = req.query.search ? req.query.search : "";
  try {
    const [results, totalCount] = await Promise.all([
      builder
        .select({
          id: "loan_header_id",
          pn_number: "pn_number",
          customername: "customername",
          loancategory: "loancategory",
          loanfacility: "loanfacility",
          principal_amount: "principal_amount",
          total_interest: "total_interest",
          date_granted: "date_granted",
          TotalPrincipalPayment: "TotalPrincipalPayment",
          TotalInterestPayment: "TotalInterestPayment",
          TotalPayment: "TotalPayment",
          PrincipalBalance: "PrincipalBalance",
          InterestBalance: "InterestBalance",
          Balance: "Balance",
        })
        .from({ c: "new_payment" })
        .modify((queryBuilder) => {
          if (search.trim() !== "") {
            queryBuilder.where("customername", "like", `%${search.trim()}%`); // Filter by customer name
          }
        })
        .limit(pageSize)
        .offset(offset),
      builder
        .count("* as count")
        .from({ c: "new_payment" })
        .modify((queryBuilder) => {
          if (search.trim() !== "") {
            queryBuilder.where("customername", "like", `%${search.trim()}%`); // Filter by customer name
          }
        })
        .first(),
    ]);

    res.json({
      data: results,
      page: page + 1,
      totalCount: totalCount.count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

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

module.exports = paymentRouter;
