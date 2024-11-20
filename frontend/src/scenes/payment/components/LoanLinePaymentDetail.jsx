import { Card, CardContent, Grid, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import dayjs from "dayjs";
import { tokens } from "../../../theme";
import { useTheme } from "@emotion/react";

const LoanLinePaymentDetail = ({id, paymentDataSetter}) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [details, setDetails] = useState([]);

    useEffect(() => {
        const getDetail = async () => {
          const req = await fetch(
            `/api/payments/paymentDue/${id}`
          );
          const resJson = await req.json(); // array
          // const { loan_detail_id, Principal_Due, Interest_Due, Penalty_Due } = resJson
          // paymentDataSetter((old) => ({...old, loan_detail_id}))
          console.log(resJson)
          setDetails(resJson);
        };
        getDetail();
      }, []);
  return (
    <main>
        {details.map((detail) => (
            <Grid container spacing={2} my={1.5} key={detail.loan_detail_id}>
              <Grid item xs={12}>
                <Card
                  variant="outlined"
                  sx={{ minWidth: 275, background: colors.greenAccent[900] }}
                >
                  <CardContent>
                    <Typography
                      sx={{ fontSize: 14, mb: 2.5 }}
                      color="text.secondary"
                      gutterBottom
                    >
                      Customer Details
                    </Typography>
                    <Typography variant="h4" component="div">
                      {detail.customer_fullname}
                    </Typography>
                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                      Borrower
                    </Typography>
                    <Typography variant="h4" component="div">
                      {detail.pn_number}
                    </Typography>
                    <Typography sx={{ mb: 0.5 }} color="text.secondary">
                      PN Number
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card
                  variant="outlined"
                  sx={{ minWidth: 275, background: colors.greenAccent[900] }}
                >
                  <CardContent>
                    <Typography
                      sx={{ fontSize: 14, mb: 2.5 }}
                      color="text.secondary"
                      gutterBottom
                    >
                      Due Date Details
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="h4" component="div">
                          {dayjs(detail.due_date).format("MMMM DD, YYYY")}
                        </Typography>
                        <Typography sx={{ mb: 1.5 }} color="text.secondary">
                          Due Date
                        </Typography>
                        <Typography variant="h4" component="div">
                          {Number(detail.Penalty_Due).toLocaleString("en", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Typography>
                        <Typography sx={{ mb: 1.5 }} color="text.secondary">
                          Penalty
                        </Typography>
                        <Typography variant="h4" component="div">
                          {Number(detail.Principal_Due).toLocaleString("en", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Typography>
                        <Typography sx={{ mb: 1.5 }} color="text.secondary">
                          Principal Due
                        </Typography>
                        <Typography variant="h4" component="div">
                          {Number(detail.Interest_Due).toLocaleString("en", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Typography>
                        <Typography sx={{ mb: 1.5 }} color="text.secondary">
                          Interest Due
                        </Typography>
                        <Typography variant="h4" component="div">
                          {(
                            Number(detail.Principal_Due) +
                            Number(detail.Interest_Due) +
                            Number(detail.Penalty_Due)
                          ).toLocaleString("en", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Typography>
                        <Typography sx={{ mb: 0.5 }} color="text.secondary">
                          Total
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="h4" component="div">
                          {detail.bank_name}
                        </Typography>
                        <Typography sx={{ mb: 1.5 }} color="text.secondary">
                          Bank PDC
                        </Typography>
                        <Typography variant="h4" component="div">
                          {detail.check_number}
                        </Typography>
                        <Typography sx={{ mb: 0.5 }} color="text.secondary">
                          Check Number
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ))}
    </main>
  )
}

export default LoanLinePaymentDetail