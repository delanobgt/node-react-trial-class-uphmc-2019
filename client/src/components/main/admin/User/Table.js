import _ from "lodash";
import React, { Fragment } from "react";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import moment from "moment";
import ReactTable from "react-table";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import {
  Delete as DeleteIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  People as PeopleIcon,
  Replay as ReplayIcon,
  Person as PersonIcon,
  FiberManualRecord as FiberManualRecordIcon
} from "@material-ui/icons";

import ExportToExcel from "../../../misc/ExportToExcel";

const ROLE_ICON = {
  SUPER_ADMIN: PeopleIcon,
  ADMIN: PersonIcon
};

/*
  accessor => sorting purpose
  plain => export as excel purpose
  Cell => table display purpose
*/
const makeColumns = ({ props, toggleDialog, allRoles }) => [
  { Header: "No", accessor: row => row.orderNo, width: 50 },
  { Header: "ID", accessor: row => row._id },
  {
    Header: "Email",
    width: 210,
    accessor: row => row.email,
    Cell: ({ original: row }) => (
      <div style={{ display: "flex", alignItems: "center" }}>
        <Tooltip title={row.connected ? "Online" : "Offline"} placement="top">
          <FiberManualRecordIcon
            style={{
              color: row.connected ? "limegreen" : "red",
              marginRight: "0.35em"
            }}
          />
        </Tooltip>
        {row.email}
      </div>
    )
  },
  {
    Header: "Password",
    accessor: row => (row.password ? "PASSWORD_SET" : "PASSWORD_NOT_SET"),
    Cell: ({ original: row }) =>
      row.password ? (
        <span style={{ color: "green" }}>PASSWORD_SET</span>
      ) : (
        <span style={{ color: "red" }}>PASSWORD_NOT_SET</span>
      )
  },
  {
    Header: "Role",
    accessor: row => row.role,
    Cell: ({ original: row }) => {
      const RoleIcon = ROLE_ICON[row.role];
      return (
        <Fragment>
          <div>
            <RoleIcon style={{ marginRight: "0.2em" }} />
            {row.role}
          </div>
          <div style={{ textAlign: "right" }}>
            <Tooltip title="Edit role" placement="top">
              <IconButton
                onClick={() =>
                  toggleDialog("EditRoleDialog")({
                    ...row,
                    allRoles
                  })
                }
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
          </div>
        </Fragment>
      );
    }
  },
  {
    Header: "Banned",
    accessor: row => (row.banned ? "BANNED" : "NOT_BANNED"),
    Cell: ({ original: row }) =>
      row.banned ? (
        <span style={{ color: "red" }}>BANNED</span>
      ) : (
        <span style={{ color: "green" }}>NOT_BANNED</span>
      )
  },
  {
    Header: "Joined At",
    accessor: row => moment(row.createdAt).valueOf(),
    plain: createdAtMs => moment(createdAtMs).format("D MMM YYYY"),
    Cell: ({ original: row }) => moment(row.createdAt).format("D MMM YYYY")
  },
  {
    Header: "Actions",
    width: 170,
    accessor: () => "",
    plain: () => "",
    Cell: ({ original: row }) => (
      <div style={{ textAlign: "center" }}>
        {row.email === props.email ? (
          <Typography variant="subtitle1">[No actions]</Typography>
        ) : (
          <Fragment>
            <Tooltip title="Reset Password" placement="top">
              <IconButton
                onClick={() => toggleDialog("ResetUserPasswordDialog")(row)}
              >
                <ReplayIcon />
              </IconButton>
            </Tooltip>
            {row.banned ? (
              <Tooltip title="Unban" placement="top">
                <IconButton onClick={() => toggleDialog("BanUserDialog")(row)}>
                  <CheckCircleIcon />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Ban" placement="top">
                <IconButton onClick={() => toggleDialog("BanUserDialog")(row)}>
                  <CancelIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Delete" placement="top">
              <IconButton onClick={() => toggleDialog("DeleteUserDialog")(row)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Fragment>
        )}
      </div>
    )
  }
];

export const ExcelButton = ({ data }) => {
  const columns = makeColumns({});
  return (
    <ExportToExcel
      filename="User List"
      rows={data}
      headers={columns.map(col => col.Header)}
      accessors={columns.map(col => col.accessor)}
      plains={columns.map(col => col.plain)}
      actionElement={
        <Button variant="outlined" color="primary">
          Excel
        </Button>
      }
    />
  );
};

export default ({ data, props, toggleDialog, allRoles }) => {
  const columns = makeColumns({ props, toggleDialog, allRoles });

  // table filter method
  const containFilter = (filter, row) => {
    const id = Number(filter.id);
    return columns[id].plain
      ? String(columns[id].plain(row[id]))
          .toLowerCase()
          .includes(filter.value.toLowerCase())
      : String(row[id])
          .toLowerCase()
          .includes(filter.value.toLowerCase());
  };

  return (
    <div>
      <ReactTable
        data={data}
        defaultPageSize={10}
        filterable
        className="-striped -highlight"
        columns={_.map(columns, (column, index) =>
          _.pickBy(
            {
              id: String(index),
              width: column.width,
              style: { whiteSpace: "unset" },
              Header: column.Header,
              accessor: column.accessor,
              Cell: column.Cell,
              filterMethod: containFilter
            },
            prop => prop
          )
        )}
      />
      <Typography variant="subtitle1" style={{ textAlign: "right" }}>
        {data.length} entries
      </Typography>
    </div>
  );
};
