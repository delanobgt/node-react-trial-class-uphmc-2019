import "react-table/react-table.css";
import _ from "lodash";
import React, { Fragment } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import ReactTable from "react-table";
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import Chip from "@material-ui/core/Chip";
import IconButton from "@material-ui/core/IconButton";
import { withStyles } from "@material-ui/core/styles";
import { Delete as DeleteIcon } from "@material-ui/icons";

import * as employeeActions from "../../../../actions/employee";
import * as snackbarActions from "../../../../actions/snackbar";

const styles = theme => ({
  retryText: {
    textAlign: "center"
  },
  retryButton: {
    display: "block",
    margin: "auto",
    textAlign: "center"
  },
  headline: {
    marginBottom: "1em"
  },
  excelButton: {
    marginBottom: "1em"
  },
  paper: {
    padding: "2em"
  }
});

const headers = [
  "nik",
  "nama_depan",
  "nama_tengah",
  "nama_belakang",
  "kategori_pegawai"
].map(header => ({ type: null, name: header }));

const LOADING = "LOADING",
  ERROR = "ERROR",
  DONE = "DONE";

const CHIP_BG_COLOR_DICT = {
  ADJUSTED: "orange",
  SAVED: "limegreen"
};

class UpdateResultTable extends React.Component {
  state = {
    loadingStatus: LOADING,
    toBeDeleted: {}
  };

  toggleDelete = (id, bool) => {
    this.setState({
      toBeDeleted: {
        ...this.state.toBeDeleted,
        [id]: bool
      }
    });
  };

  handleDeleteClick = d => {
    const { plainSnackbar, errorSnackbar, deleteEmployeeById } = this.props;
    this.toggleDelete(d._id, true);
    plainSnackbar(`Deleted employee ${d._id.slice(0, 10)}...`, {
      undoCallback: () => {
        this.toggleDelete(d._id, false);
      },
      closeCallback: async () => {
        try {
          await deleteEmployeeById(d._id);
        } catch (error) {
          console.log({ error });
          this.toggleDelete(d._id, false);
          errorSnackbar(`Failed to delete employee ${d._id.slice(0, 10)}...`);
        }
      }
    });
  };

  fetchData = async () => {
    const { getEmployees } = this.props;
    try {
      this.setState({ loadingStatus: LOADING });
      await getEmployees({ headers });
      this.setState({ loadingStatus: DONE });
    } catch (error) {
      console.log({ error });
      this.setState({ loadingStatus: ERROR });
    }
  };

  async componentDidMount() {
    await this.fetchData();
  }

  render() {
    const { classes, employees } = this.props;
    const { loadingStatus, toBeDeleted } = this.state;
    const updatedDocuments = _.mapKeys(this.props.updatedDocuments, "_id");

    const columns = [
      { Header: "No", accessor: d => d.orderNo },
      { Header: "NIK", accessor: d => d.nik },
      {
        Header: "Nama",
        accessor: d =>
          _.chain([d.nama_depan, d.nama_tengah, d.nama_belakang])
            .compact()
            .map(name => name.trim())
            .join(" ")
            .value()
      },
      {
        Header: "Kategori Pegawai",
        accessor: d => d.kategori_pegawai || "-"
      },
      {
        Header: "Department",
        accessor: d => d.department || "-"
      },
      {
        Header: "Status",
        accessor: d =>
          updatedDocuments[d._id] ? updatedDocuments[d._id].status : "",
        Cell: ({ original: d }) =>
          updatedDocuments[d._id] ? (
            <Chip
              label={updatedDocuments[d._id].status}
              style={{
                color: "white",
                backgroundColor:
                  CHIP_BG_COLOR_DICT[updatedDocuments[d._id].status]
              }}
            />
          ) : (
            <Chip label="UNDEFINED" color="secondary" />
          )
      },
      {
        Header: "Actions",
        accessor: () => "",
        Cell: ({ original: d }) => (
          <div style={{ textAlign: "center" }}>
            <IconButton onClick={() => this.handleDeleteClick(d)}>
              <DeleteIcon />
            </IconButton>
          </div>
        )
      }
    ];

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

    let mainContent = null;

    if (loadingStatus === ERROR) {
      mainContent = (
        <Fragment>
          <Typography variant="subheading" className={classes.retryText}>
            Cannot fetch data.
          </Typography>
          <Button
            color="primary"
            className={classes.retryButton}
            onClick={this.fetchData}
          >
            Retry
          </Button>
        </Fragment>
      );
    } else if (loadingStatus === LOADING) {
      mainContent = (
        <div style={{ textAlign: "center" }}>
          <CircularProgress size={50} />
        </div>
      );
    } else {
      const data = _.chain(employees)
        .pickBy(
          emp => Boolean(updatedDocuments[emp._id]) && !toBeDeleted[emp._id]
        )
        .values()
        .sortBy([emp => emp.nik])
        .map((emp, index) => ({
          ...emp,
          orderNo: index + 1
        }))
        .value();

      mainContent = (
        <Fragment>
          <ReactTable
            data={data}
            filterable
            defaultFilterMethod={containFilter}
            defaultPageSize={10}
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
        </Fragment>
      );
    }

    return (
      <Paper className={classes.paper} elevation={3}>
        {mainContent}
      </Paper>
    );
  }
}

function mapStateToProps(state) {
  return {
    ...state.employee
  };
}

export default compose(
  withStyles(styles),
  connect(
    mapStateToProps,
    { ...employeeActions, ...snackbarActions }
  )
)(UpdateResultTable);
