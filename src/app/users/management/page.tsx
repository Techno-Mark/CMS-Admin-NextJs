import { Grid } from "@mui/material";
import React from "react";
import UserListCards from "./UserListCards";
import UserListTable from "./UserListTable";

const page = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <UserListCards />
      </Grid>
      <Grid item xs={12}>
        <UserListTable />
      </Grid>
    </Grid>
  );
};

export default page;
