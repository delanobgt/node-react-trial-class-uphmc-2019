import "react-table/react-table.css";
import _ from "lodash";
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

import * as participantActions from "../../../actions/participant";
import requireAuth from "../../hoc/requireAuth";
import ExportToExcel from "../../misc/ExportToExcel";
import CreateParticipantDialog from "./dialogs/CreateParticipantDialog";
import EditParticipantDialog from "./dialogs/EditParticipantDialog";
import DeleteParticipantDialog from "./dialogs/DeleteParticipantDialog";

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

class ParticipantListIndex extends React.Component {
  state = {
    loadingStatus: LOADING
  };

  fetchData = async () => {
    const { getParticipants } = this.props;
    try {
      this.setState({ loadingStatus: LOADING });
      await getParticipants();
      this.setState({ loadingStatus: DONE });
    } catch (error) {
      console.log({ error });
      this.setState({ loadingStatus: ERROR });
    }
  };

  toggleDialog = stateName => open =>
    console.log(open) ||
    this.setState(state => ({
      [stateName]: open === undefined ? !Boolean(state[stateName]) : open
    }));

  async componentDidMount() {
    await this.fetchData();
  }

  render() {
    const { classes, participants } = this.props;
    const { loadingStatus } = this.state;

    const columns = [
      { Header: "Order Number", accessor: d => d.orderNumber },
      {
        Header: "Fullname",
        accessor: d => d.fullname || "-"
      },
      { Header: "Email", accessor: d => d.email || "-" },
      {
        Header: "Actions",
        accessor: () => "",
        Cell: ({ original: d }) => (
          <div style={{ textAlign: "center" }}>
            <IconButton
              onClick={() => this.toggleDialog("EditParticipantDialog")(d)}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              onClick={() => this.toggleDialog("DeleteParticipantDialog")(d)}
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
      const data = _.chain(participants)
        .values()
        .sortBy([p => p.fullname])
        .map((p, index) => ({ ...p, orderNumber: index + 1 }))
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
              onClick={() => this.toggleDialog("CreateParticipantDialog")(true)}
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
                All Participants
              </Typography>
              <br />
              {mainContent}
            </Paper>
          </Grid>
        </Grid>
        <CreateParticipantDialog
          name="CreateParticipantDialog"
          state={this.state}
          toggleDialog={this.toggleDialog}
        />
        {this.state.EditParticipantDialog && (
          <EditParticipantDialog
            name="EditParticipantDialog"
            state={this.state}
            toggleDialog={this.toggleDialog}
          />
        )}
        <DeleteParticipantDialog
          name="DeleteParticipantDialog"
          state={this.state}
          toggleDialog={this.toggleDialog}
        />
      </Fragment>
    );
  }
}

function mapStateToProps(state) {
  return {
    ...state.participant
  };
}

export default compose(
  requireAuth,
  withStyles(styles),
  connect(
    mapStateToProps,
    { ...participantActions }
  )
)(ParticipantListIndex);
