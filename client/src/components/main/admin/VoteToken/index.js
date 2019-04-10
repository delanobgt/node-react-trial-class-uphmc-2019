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
import Chip from "@material-ui/core/Chip";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import { Delete as DeleteIcon, Search as SearchIcon } from "@material-ui/icons";
import { withStyles } from "@material-ui/core/styles";

import * as candidateActions from "../../../../actions/candidate";
import * as voteTokenActions from "../../../../actions/voteToken";
import requireAuth from "../../../hoc/requireAuth";
import ExportToExcel from "../../../misc/ExportToExcel";
import CreateVoteTokenDialog from "./dialogs/CreateVoteTokenDialog";
import DeleteVoteTokenDialog from "./dialogs/DeleteVoteTokenDialog";
import DeleteSelectedVoteTokenDialog from "./dialogs/DeleteSelectedVoteTokenDialog";
import ViewQRCodeDialog from "./dialogs/ViewQRCodeDialog";

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
    loadingStatus: LOADING,
    showUsed: true,
    showUnused: true,
    toBeDeleted: {}
  };

  handleSelectedTokenValuesDeleted = ({ successIds, failIds }) => {
    this.setState({
      toBeDeleted: _.pickBy(this.state.toBeDeleted, tbd => failIds[tbd])
    });
  };

  handleDeleteCheckboxChange = stateName => () => {
    this.setState({
      toBeDeleted: {
        ...this.state.toBeDeleted,
        [stateName]: !Boolean(this.state.toBeDeleted[stateName])
      }
    });
  };

  handleFilterCheckboxChange = stateName => () => {
    this.setState({
      [stateName]: !Boolean(this.state[stateName])
    });
  };

  fetchData = async () => {
    const { getCandidates, getVoteTokens } = this.props;
    try {
      this.setState({ loadingStatus: LOADING });
      await Promise.all([getCandidates(), getVoteTokens()]);
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
    const { classes, candidates, voteTokens } = this.props;
    const { loadingStatus, showUnused, showUsed, toBeDeleted } = this.state;

    const columns = [
      {
        Header: "",
        accessor: d => "",
        Cell: ({ original: d }) => (
          <Checkbox
            checked={Boolean(toBeDeleted[d._id])}
            onChange={this.handleDeleteCheckboxChange(d._id)}
            value={toBeDeleted[d._id]}
          />
        )
      },
      { Header: "No", accessor: d => d.orderNo },
      {
        Header: "Value",
        accessor: d => d.value,
        Cell: ({ original: d }) => (
          <div>
            {d.value}
            <div style={{ textAlign: "right" }}>
              <IconButton
                onClick={() => this.toggleDialog("ViewQRCodeDialog")(d)}
              >
                <SearchIcon />
              </IconButton>
            </div>
          </div>
        )
      },
      {
        Header: "Candidate Name",
        accessor: d =>
          d.candidate
            ? `${d.candidate.fullname} (${d.candidate.orderNumber})`
            : "-"
      },
      {
        Header: "Used At",
        accessor: d => (d.usedAt ? moment(d.usedAt).valueOf() : null),
        plain: dateMs => (dateMs ? moment(dateMs).format("D MMMM YYYY") : "-"),
        Cell: ({ original: d }) =>
          d.usedAt ? moment(d.usedAt).format("D MMMM YYYY") : "-"
      },
      {
        Header: "Candidate Name",
        accessor: d => d.candidateId || "-",
        Cell: ({ original: d }) => (
          <Chip
            label={d.candidateId ? "USED" : "UN-USED"}
            color={d.candidateId ? "secondary" : "primary"}
          />
        )
      },
      {
        Header: "Actions",
        accessor: () => "",
        Cell: ({ original: d }) => (
          <div style={{ textAlign: "center" }}>
            <IconButton
              onClick={() => this.toggleDialog("DeleteVoteTokenDialog")(d)}
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
      const candidateDict = _.mapKeys(candidates, "_id");
      const data = _.chain(voteTokens)
        .values()
        .sortBy([voteToken => moment(voteToken.createdAt).valueOf()])
        .map((voteToken, index) => ({
          ...voteToken,
          orderNo: index + 1,
          candidate: candidateDict[voteToken.candidateId]
        }))
        .filter(
          voteToken =>
            (Boolean(voteToken.candidateId) && showUsed) ||
            (!Boolean(voteToken.candidateId) && showUnused)
        )
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
            <div>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showUsed}
                    onChange={this.handleFilterCheckboxChange("showUsed")}
                    value={showUsed}
                  />
                }
                label="Show Used"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showUnused}
                    onChange={this.handleFilterCheckboxChange("showUnused")}
                    value={showUnused}
                    color="primary"
                  />
                }
                label="Show Unused"
                style={{ marginLeft: "1em" }}
              />
            </div>
            <div>
              <Button
                variant="contained"
                color="primary"
                onClick={() => this.toggleDialog("CreateVoteTokenDialog")(true)}
              >
                Create
              </Button>
              {Boolean(_.size(toBeDeleted)) && (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() =>
                    this.toggleDialog("DeleteSelectedVoteTokenDialog")(
                      toBeDeleted
                    )
                  }
                  style={{ marginLeft: "1em" }}
                >
                  Delete Selected
                </Button>
              )}
            </div>
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
      <Fragment>
        <Grid container justify="center">
          <Grid item xs={11}>
            <Paper className={classes.paper} elevation={3}>
              <Typography variant="h5" gutterBottom>
                All Vote Tokens
              </Typography>
              <br />
              {mainContent}
            </Paper>
          </Grid>
        </Grid>
        <CreateVoteTokenDialog
          name="CreateVoteTokenDialog"
          state={this.state}
          toggleDialog={this.toggleDialog}
        />
        <DeleteVoteTokenDialog
          name="DeleteVoteTokenDialog"
          state={this.state}
          toggleDialog={this.toggleDialog}
        />
        <DeleteSelectedVoteTokenDialog
          name="DeleteSelectedVoteTokenDialog"
          state={this.state}
          toggleDialog={this.toggleDialog}
          onActionPerformed={this.handleSelectedTokenValuesDeleted}
        />
        <ViewQRCodeDialog
          name="ViewQRCodeDialog"
          state={this.state}
          toggleDialog={this.toggleDialog}
        />
      </Fragment>
    );
  }
}

function mapStateToProps(state) {
  return {
    ...state.candidate,
    ...state.voteToken
  };
}

export default compose(
  withStyles(styles),
  connect(
    mapStateToProps,
    { ...candidateActions, ...voteTokenActions }
  ),
  requireAuth
)(CandidateListIndex);