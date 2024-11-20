const express = require("express");
const customerInfoRouter = express.Router();
const builder = require("../builder");
const multer = require("multer");
const { upload } = require("../middleware/multerMiddleware");

customerInfoRouter.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;
    const search = req.query.search ? req.query.search : "";

    const [results, totalCount] = await Promise.all([
      builder
        .select({
          id: "customerid",
          fullname: builder.raw(
            "CONCAT_WS(', ', ??, CONCAT(??, ' ', SUBSTRING(??, 1, 1), '.'))",
            ["clname", "cfname", "cmname"]
          ),
          contactNo: "contactno",
          address: "address",
          gender: "gender",
          cimg: "cimg",
          tin: "tin",
        })
        .from({ c: "customertbl" })
        .modify((queryBuilder) => {
          if (search.trim() !== "") {
            queryBuilder.where((qb) => {
              qb.where("clname", "like", `%${search.trim()}%`).orWhere(
                "cfname",
                "like",
                `%${search.trim()}%`
              );
            }); 
          }
        })
        .limit(pageSize)
        .offset(offset),
      builder
        .count("* as count")
        .from({ c: "customertbl" })
        .modify((queryBuilder) => {
          if (search.trim() !== "") {
            queryBuilder.where((qb) => {
              qb.where("clname", "like", `%${search.trim()}%`).orWhere(
                "cfname",
                "like",
                `%${search.trim()}%`
              );
            }); 
          }
        })
        .first(),
    ]);

    res.json({
      data: results,
      page: page + 1,
      totalCount: totalCount.count,
    });
  } catch (err) {
    console.log(err)
    res.status(500).send({
      message: "Error fetching customers",
      error: err,
    });
  }
});

customerInfoRouter.get("/read/:id", async (req, res) => {
  const id = req.params.id;
  const customer = await builder
    .select("*")
    .from("customertbl")
    .where("customerid", id);
  res.status(200).json(customer);
});

customerInfoRouter.post("/new", upload.single("cimg"), async (req, res) => {
  try {
    
    const customerData = {
      cfname: req.body.cfname,
      cmname: req.body.cmname,
      clname: req.body.clname,
      address: req.body.address,
      contactno: req.body.contactno,
      birthdate: req.body.birthdate,
      gender: req.body.gender,
      maritalstatus: req.body.maritalstatus,
      spousefname: req.body.spousefname,
      spousemname: req.body.spousemname,
      spouselname: req.body.spouselname,
      spouseaddress: req.body.spouseaddress,
      spousebirthdate: req.body.spousebirthdate,
      spousegender: req.body.spousegender,
      spousemaritalstatus: req.body.spousemaritalstatus,
      spousecontactno: req.body.spousecontactno,
      tin: req.body.tin,
      cimg: req.file ? req.file.filename : null 
    };

    
    const [id] = await builder("customertbl").insert(customerData, ["customerid"]);

    res.status(200).json({ id: id, message: "Customer added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});


customerInfoRouter.put("/edit/:id", upload.single("cimg"), async (req, res) => {
  try {
      const customerId = req.params.id;
     
      const updatedCustomer = {
        cfname: req.body.cfname,
        cmname: req.body.cmname,
        clname: req.body.clname,
        address: req.body.address,
        contactno: req.body.contactno,
        birthdate: req.body.birthdate,
        gender: req.body.gender,
        maritalstatus: req.body.maritalstatus,
        spousefname: req.body.spousefname,
        spousemname: req.body.spousemname,
        spouselname: req.body.spouselname,
        spouseaddress: req.body.spouseaddress,
        spousebirthdate: req.body.spousebirthdate,
        spousegender: req.body.spousegender,
        spousemaritalstatus: req.body.spousemaritalstatus,
        spousecontactno: req.body.spousecontactno,
        cimg: req.file ? req.file.filename : req.body.cimg,
        tin: req.body.tin
      };

      await builder("customertbl")
          .where("customerid", customerId)
          .update(updatedCustomer);

      res.status(200).json({
          message: "Customer updated successfully",updatedCustomer
      });
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
      res.status(404).json({ error: "Customer not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = customerInfoRouter;
