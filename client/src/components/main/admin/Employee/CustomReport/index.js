import "react-table/react-table.css";
import _ from "lodash";
import moment from "moment";
import React, { Fragment } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import ReactTable from "react-table";
import { withStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from "@material-ui/core/Grid";
import Chip from "@material-ui/core/Chip";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Paper from "@material-ui/core/Paper";

import * as employeeActions from "../../../../../actions/employee";
import * as snackbarActions from "../../../../../actions/snackbar";
import ExportToExcel from "../../../../misc/ExportToExcel";
import hasRole from "../../../../hoc/hasRole";

const LOADING = "LOADING",
  ERROR = "ERROR",
  DONE = "DONE";

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
  selectedButton: {
    textTransform: "none"
  },
  generateButton: {
    display: "block",
    margin: "1em 0"
  },
  divider: {
    margin: "1em 0"
  },
  chip: {
    marginRight: "1em",
    marginBottom: "1em"
  },
  paper: {
    padding: "2.5em"
  }
});

class CustomReportIndex extends React.Component {
  state = {
    headerLoadingStatus: DONE,
    employeeLoadingStatus: DONE,
    allHeaders: {},
    headerSelectOpen: false
  };

  fetchHeaders = async () => {
    const { setEmployeeHeaders, getAllEmployeeHeaders } = this.props;
    try {
      this.setState({ headerLoadingStatus: LOADING });
      setEmployeeHeaders([]);
      const { headers } = await getAllEmployeeHeaders();
      const withSelectedHeaders = _.chain(headers)
        .mapKeys(({ name }) => name)
        .mapValues(header => ({ ...header, selected: false }))
        .value();
      this.setState({
        allHeaders: {
          ...withSelectedHeaders,
          nik: { ...withSelectedHeaders["nik"], selected: true },
          nama_depan: { ...withSelectedHeaders["nama_depan"], selected: true },
          nama_belakang: {
            ...withSelectedHeaders["nama_belakang"],
            selected: true
          }
        },
        headerLoadingStatus: DONE
      });
      setEmployeeHeaders([
        withSelectedHeaders["nik"],
        withSelectedHeaders["nama_depan"],
        withSelectedHeaders["nama_belakang"]
      ]);
    } catch (error) {
      console.log({ error });
      this.setState({ headerLoadingStatus: ERROR });
    }
  };

  fetchEmployees = async () => {
    const { allHeaders } = this.state;
    const newHeaders = _.chain(allHeaders)
      .pickBy(header => header.selected)
      .values()
      .value();
    const { getEmployees } = this.props;
    try {
      this.setState({ employeeLoadingStatus: LOADING });
      await getEmployees({ headers: newHeaders });
      this.setState({ employeeLoadingStatus: DONE });
    } catch (error) {
      console.log({ error });
      this.setState({ employeeLoadingStatus: ERROR });
    }
  };

  async componentDidMount() {
    const { emptyEmployees } = this.props;
    emptyEmployees();
    await this.fetchHeaders();
  }

  render() {
    const { employees, headers, classes } = this.props;
    const {
      headerLoadingStatus,
      employeeLoadingStatus,
      allHeaders,
      headerSelectOpen
    } = this.state;

    let headerContent = null;
    if (headerLoadingStatus === ERROR) {
      headerContent = (
        <Fragment>
          <Typography variant="subtitle1" className={classes.retryText}>
            Cannot fetch headers!
          </Typography>
          <Button
            color="primary"
            className={classes.retryButton}
            onClick={() => this.fetchHeaders()}
          >
            Retry
          </Button>
        </Fragment>
      );
    } else if (headerLoadingStatus === LOADING || _.size(allHeaders) === 0) {
      headerContent = (
        <div style={{ textAlign: "center" }}>
          <CircularProgress size={50} />
        </div>
      );
    } else {
      const selectedHeaderCount = _.chain(allHeaders)
        .pickBy(({ selected }) => selected)
        .size()
        .value();

      headerContent = (
        <Fragment>
          <Typography variant="subtitle1" className={classes.headline}>
            Selected Headers
          </Typography>
          <div>
            {selectedHeaderCount ? (
              _.chain(allHeaders)
                .pickBy(({ selected }) => selected)
                .map(({ type, name }) => (
                  <Chip
                    label={_.startCase(name)}
                    key={name}
                    onDelete={() =>
                      this.setState({
                        allHeaders: {
                          ...allHeaders,
                          [name]: { type, name, selected: false }
                        }
                      })
                    }
                    className={classes.chip}
                    color="primary"
                    variant="outlined"
                  />
                ))
                .value()
            ) : (
              <Typography variant="body2" style={{ color: "red" }}>
                No selected header.
              </Typography>
            )}
          </div>
          <br />
          <div>
            <InputLabel htmlFor="header-select">
              Add another header&nbsp;&nbsp;
            </InputLabel>
            <Select
              open={headerSelectOpen}
              onClose={() => this.setState({ headerSelectOpen: false })}
              onOpen={() => this.setState({ headerSelectOpen: true })}
              onChange={e =>
                this.setState({
                  allHeaders: {
                    ...allHeaders,
                    [e.target.value]: {
                      ...allHeaders[e.target.value],
                      selected: true
                    }
                  }
                })
              }
              value="Choose a header"
              inputProps={{
                id: "header-select"
              }}
            >
              {_.chain(allHeaders)
                .pickBy(({ selected }) => !selected)
                .map(({ name }) => name)
                .sortBy([name => name])
                .map(name => (
                  <MenuItem key={name} value={name}>
                    {_.startCase(name)}
                  </MenuItem>
                ))
                .value()}
            </Select>
          </div>
          <Divider light className={classes.divider} />
          <Button
            variant="contained"
            color="primary"
            className={classes.generateButton}
            onClick={this.fetchEmployees}
            disabled={
              employeeLoadingStatus === LOADING || selectedHeaderCount === 0
            }
          >
            Generate
          </Button>
        </Fragment>
      );
    }

    let employeeContent = null;
    if (employeeLoadingStatus === ERROR) {
      employeeContent = (
        <Fragment>
          <Typography variant="subtitle1" className={classes.retryText}>
            Cannot fetch employees!
          </Typography>
          <Button
            color="primary"
            className={classes.retryButton}
            onClick={() => this.fetchEmployees()}
          >
            Retry
          </Button>
        </Fragment>
      );
    } else if (employeeLoadingStatus === LOADING) {
      employeeContent = (
        <div style={{ textAlign: "center" }}>
          <CircularProgress size={50} />
        </div>
      );
    } else {
      const columns = [
        {
          Header: "No",
          accessor: d => d.orderNo
        },
        ..._.chain(headers)
          .values()
          .map(({ type, name }) =>
            type === "Date"
              ? {
                  Header: _.startCase(name),
                  accessor: d => (d[name] ? moment(d[name]).valueOf() : null),
                  plain: dateMs =>
                    dateMs ? moment(dateMs).format("D MMMM YYYY") : "-",
                  Cell: ({ original: d }) =>
                    d[name] ? moment(d[name]).format("D MMMM YYYY") : "-"
                }
              : {
                  Header: _.startCase(name),
                  accessor: d => d[name] || "-"
                }
          )
          .value()
      ];

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

      const data = _.chain(employees)
        .values()
        .map((row, index) => ({
          ...row,
          orderNo: index + 1
        }))
        .value();

      employeeContent = (
        <Fragment>
          <ExportToExcel
            rows={data}
            headers={columns.map(col => col.Header)}
            accessors={columns.map(col => col.accessor)}
            plains={columns.map(col => col.plain)}
            filename="[HRIS] Custom Report"
            actionElement={
              <Button
                variant="outlined"
                color="primary"
                className={classes.excelButton}
              >
                Excel
              </Button>
            }
          />
          <div>
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
          </div>
        </Fragment>
      );
    }

    return (
      <Fragment>
        <Grid container justify="center">
          <Grid item xs={11}>
            <Paper className={classes.paper} elevation={3}>
              <Typography variant="h5" className={classes.headline}>
                Custom Report
              </Typography>
              <Divider light className={classes.divider} />
              {headerContent}
            </Paper>
            <br />
            <br />
            {Boolean(
              _.size(employees) === 0 && employeeLoadingStatus === DONE
            ) || (
              <Paper className={classes.paper} elevation={3}>
                {employeeContent}
              </Paper>
            )}
          </Grid>
        </Grid>
      </Fragment>
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
  ),
  hasRole("MASTER_DATA")
)(CustomReportIndex);
