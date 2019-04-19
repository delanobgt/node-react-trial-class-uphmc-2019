import "react-table/react-table.css";
import _ from "lodash";
import moment from "moment";
import React, { Fragment } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import ReactTable from "react-table";
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Paper from "@material-ui/core/Paper";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Flare as FlareIcon
} from "@material-ui/icons";
import { withStyles } from "@material-ui/core/styles";

import * as candidateActions from "../../../../actions/candidate";
import requireAuth from "../../../hoc/requireAuth";
import ExportToExcel from "../../../misc/ExportToExcel";
import CreateCandidateDialog from "./dialogs/CreateCandidateDialog";
import EditCandidateDialog from "./dialogs/EditCandidateDialog";
import DeleteCandidateDialog from "./dialogs/DeleteCandidateDialog";

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
  },
  actionDiv: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    margin: "0.5em 0"
  },
  picture: {
    width: "150px",
    height: "150px",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover"
  }
});

const LOADING = "LOADING",
  ERROR = "ERROR",
  DONE = "DONE";

class CandidateListIndex extends React.Component {
  state = {
    loadingStatus: LOADING
  };

  fetchData = async () => {
    const { getCandidates } = this.props;
    try {
      this.setState({ loadingStatus: LOADING });
      await getCandidates();
      this.setState({ loadingStatus: DONE });
    } catch (error) {
      console.log({ error });
      this.setState({ loadingStatus: ERROR });
    }
  };

  toggleDialog = stateName => open =>
    this.setState(state => ({
      [stateName]: open === undefined ? !Boolean(state[stateName]) : open
    }));

  async componentDidMount() {
    await this.fetchData();
  }

  render() {
    const { classes, candidates } = this.props;
    const { loadingStatus } = this.state;

    const columns = [
      { Header: "Order Number", accessor: d => d.orderNumber || -1 },
      {
        Header: "Fullname",
        accessor: d => d.fullname || "-"
      },
      { Header: "Major", accessor: d => d.major || "-" },
      {
        Header: "Image",
        accessor: d => _.get(d, "image.publicId", "-"),
        Cell: ({ original: d }) => (
          <div
            className={classes.picture}
            style={{
              backgroundImage: `url(${_.get(d, "image.secureUrl", null) ||
                "https://via.placeholder.com/300"})`
            }}
          />
        )
      },
      {
        Header: "Created At",
        accessor: d => (d.createdAt ? moment(d.createdAt).valueOf() : null),
        plain: dateMs => (dateMs ? moment(dateMs).format("D MMMM YYYY") : "-"),
        Cell: ({ original: d }) =>
          d.createdAt ? moment(d.createdAt).format("D MMMM YYYY") : "-"
      },
      {
        Header: "Actions",
        accessor: () => "",
        Cell: ({ original: d }) => (
          <div style={{ textAlign: "center" }}>
            <IconButton
              onClick={() => this.toggleDialog("EditCandidateDialog")(d)}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              onClick={() => this.toggleDialog("DeleteCandidateDialog")(d)}
            >
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
      const data = _.chain(candidates)
        .values()
        .sortBy([cand => cand.orderNumber])
        .value();

      mainContent = (
        <Fragment>
          <div className={classes.actionDiv}>
            <ExportToExcel
              rows={data}
              headers={columns.map(col => col.Header)}
              accessors={columns.map(col => col.accessor)}
              plains={columns.map(col => col.plain)}
              filename="[Voting System] All Candidates"
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
            <Button
              variant="contained"
              color="primary"
              onClick={() => this.toggleDialog("CreateCandidateDialog")(true)}
            >
              Create New <FlareIcon style={{ marginLeft: "0.5em" }} />
            </Button>
          </div>
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
                  style: {
                    whiteSpace: "unset",
                    display: "flex",
                    alignItems: "center"
                  },
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
      <Fragment>
        <Grid container justify="center">
          <Grid item xs={11}>
            <Paper className={classes.paper} elevation={3}>
              <Typography variant="h5" gutterBottom>
                All Candidates
              </Typography>
              <br />
              {mainContent}
            </Paper>
          </Grid>
        </Grid>
        <CreateCandidateDialog
          name="CreateCandidateDialog"
          state={this.state}
          toggleDialog={this.toggleDialog}
        />
        <EditCandidateDialog
          name="EditCandidateDialog"
          state={this.state}
          toggleDialog={this.toggleDialog}
        />
        <DeleteCandidateDialog
          name="DeleteCandidateDialog"
          state={this.state}
          toggleDialog={this.toggleDialog}
        />
      </Fragment>
    );
  }
}

function mapStateToProps(state) {
  return {
    ...state.candidate
  };
}

export default compose(
  withStyles(styles),
  connect(
    mapStateToProps,
    { ...candidateActions }
  ),
  requireAuth
)(CandidateListIndex);
