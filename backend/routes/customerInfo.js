const express = require("express");
const customerInfoRouter = express.Router();
const builder = require("../builder");

// customerInfoRouter.get('/', async (req, res) => {
//     try {
//       const customers = await builder
//         .select({
//           id: 'customerid',
//           fullname: builder.raw("CONCAT_WS(', ', ??, CONCAT(??, ' ', SUBSTRING(??, 1, 1), '.'))", ['clname', 'cfname', 'cmname']),
//           contactNo: 'contactno',
//           address: 'address',
//           gender: 'gender',
//         })
//         .from({ c: 'customertbl' });

//       res.status(200).send(customers);
//     } catch (error) {
//       console.error(error);
//       res.status(500).send('Internal Server Error');
//     }
//   });

customerInfoRouter.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    const [results, totalCount] = await Promise.all([
      builder
        .select({
          id: 'customerid',
          fullname: builder.raw("CONCAT_WS(', ', ??, CONCAT(??, ' ', SUBSTRING(??, 1, 1), '.'))", ['clname', 'cfname', 'cmname']),
          contactNo: 'contactno',
          address: 'address',
          gender: 'gender',
        })
        .from({ c: 'customertbl' })
        .limit(pageSize)
        .offset(offset),
      builder.count('* as count').from({ c: 'customertbl' }).first(),
    ]);

    res.json({
      data: results,
      page: page + 1,
      totalCount: totalCount.count,
    });
  } catch (err) {
    res.status(500).send({
      message: "Error fetching customers",
      error: err,
    });
  }
});

customerInfoRouter.get("/read/:id", async (req, res) => {
  const id = req.params.id;
  const deduction = await builder
    .select("*")
    .from("customertbl")
    .where("customerid", id);
  res.status(200).json(deduction);
});

customerInfoRouter.post("/new", async (req, res) => {
  try {
    const id = await builder("customertbl").insert(
      {
        cfname: req.body.customer.cfname,
        cmname: req.body.customer.cmname,
        clname: req.body.customer.clname,
        address: req.body.customer.address,
        contactno: req.body.customer.contactno,
        birthdate: req.body.customer.birthdate,
        gender: req.body.customer.gender,
        maritalstatus: req.body.customer.maritalstatus,
        spousefname: req.body.customer.spousefname,
        spousemname: req.body.customer.spousemname,
        spouselname: req.body.customer.spouselname,
        spouseaddress: req.body.customer.spouseaddress,
        spousebirthdate: req.body.customer.spousebirthdate,
        spousemaritalstatus: req.body.customer.spousemaritalstatus,
        spousecontactno: req.body.customer.spousecontactno,
      },
      ["customerid"]
    );

    res.status(200).json({ id: id[0], message: "Customer added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

customerInfoRouter.put("/edit/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const update = await builder("customertbl").where("customerid", id).update({
      cfname: req.body.customer.cfname,
      cmname: req.body.customer.cmname,
      clname: req.body.customer.clname,
      address: req.body.customer.address,
      contactno: req.body.customer.contactno,
      birthdate: req.body.customer.birthdate,
      gender: req.body.customer.gender,
      maritalstatus: req.body.customer.maritalstatus,
      spousefname: req.body.customer.spousefname,
      spousemname: req.body.customer.spousemname,
      spouselname: req.body.customer.spouselname,
      spouseaddress: req.body.customer.spouseaddress,
      spousebirthdate: req.body.customer.spousebirthdate,
      spousegender: req.body.customer.spousegender,
      spousemaritalstatus: req.body.customer.spousemaritalstatus,
      spousecontactno: req.body.customer.spousecontactno,
    });

    if (update > 0) {
      res.status(200).json({ message: "Customer updated successfully" });
    } else {
      res.status(404).json({ error: "Customer not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

customerInfoRouter.delete("/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const deletedCount = await builder("customertbl")
      .where("customerid", id)
      .del();

    if (deletedCount > 0) {
      res.status(200).json({ message: "Customer deleted successfully" });
    } else {
      res.status(404).json({ error: "Deduction not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = customerInfoRouter;
