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
import Paper from "@material-ui/core/Paper";
import { withStyles } from "@material-ui/core/styles";

import * as employeesActions from "../../../../actions/employee";
import hasRole from "../../../hoc/hasRole";
import ExportToExcel from "../../../misc/ExportToExcel";

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
  "kategori_pegawai",
  "tanggal_mulai_kerja_medan",
  "tanggal_mutasi_kerja_medan",
  "tanggal_berhenti_kerja",
  "tanggal_lahir",
  "jenis_kelamin",
  "kewarganegaraan",
  "jabatan",
  "cost_center",
  "status_pegawai",
  "npwp",
  "nama_pajak",
  "alamat_pajak",
  "nama_kpp",
  "status_ptkp",
  "atas_nama_bank",
  "nama_bank",
  "no_rekening",
  "bpjstk",
  "bpjskis"
].map(header => ({ type: null, name: header }));

const LOADING = "LOADING",
  ERROR = "ERROR",
  DONE = "DONE";

class PphReportIndex extends React.Component {
  state = {
    loadingStatus: LOADING
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

  toggleDialog = stateName => open =>
    this.setState(state => ({
      [stateName]: open === undefined ? !Boolean(state[stateName]) : open
    }));

  async componentDidMount() {
    await this.fetchData();
  }

  render() {
    const { classes, employees } = this.props;
    const { loadingStatus } = this.state;

    const columns = [
      { Header: "No", accessor: d => d.orderNo },
      { Header: "NIK", accessor: d => d.nik },
      { Header: "Kategori Pegawai", accessor: d => d.kategori_pegawai || "-" },
      {
        Header: "Tanggal Mulai Kerja",
        accessor: d =>
          d.tanggal_mulai_kerja_medan
            ? moment(d.tanggal_mulai_kerja_medan).valueOf()
            : null,
        plain: tanggalMs =>
          tanggalMs ? moment(tanggalMs).format("D MMMM YYYY") : "-",
        Cell: ({ original: d }) =>
          d.tanggal_mulai_kerja_medan
            ? moment(d.tanggal_mulai_kerja_medan).format("D MMMM YYYY")
            : "-"
      },
      {
        Header: "Tanggal Mutasi Kerja",
        accessor: d =>
          d.tanggal_mutasi_kerja_medan
            ? moment(d.tanggal_mutasi_kerja_medan).valueOf()
            : null,
        plain: tanggalMs =>
          tanggalMs ? moment(tanggalMs).format("D MMMM YYYY") : "-",
        Cell: ({ original: d }) =>
          d.tanggal_mutasi_kerja_medan
            ? moment(d.tanggal_mutasi_kerja_medan).format("D MMMM YYYY")
            : "-"
      },
      {
        Header: "Tanggal Berhenti Kerja",
        accessor: d =>
          d.tanggal_berhenti_kerja
            ? moment(d.tanggal_berhenti_kerja).valueOf()
            : null,
        plain: tanggalMs =>
          tanggalMs ? moment(tanggalMs).format("D MMMM YYYY") : "-",
        Cell: ({ original: d }) =>
          d.tanggal_berhenti_kerja
            ? moment(d.tanggal_berhenti_kerja).format("D MMMM YYYY")
            : "-"
      },
      {
        Header: "Tanggal Lahir",
        accessor: d =>
          d.tanggal_lahir ? moment(d.tanggal_lahir).valueOf() : null,
        plain: tanggalLahirMs =>
          tanggalLahirMs ? moment(tanggalLahirMs).format("D MMMM YYYY") : "-",
        Cell: ({ original: d }) =>
          d.tanggal_lahir ? moment(d.tanggal_lahir).format("D MMMM YYYY") : "-"
      },
      { Header: "Jenis Kelamin", accessor: d => d.jenis_kelamin || "-" },
      { Header: "Jabatan", accessor: d => d.jabatan || "-" },
      { Header: "Cost Center", accessor: d => d.cost_center || "-" },
      { Header: "Status Pegawai", accessor: d => d.status_pegawai || "-" },
      { Header: "NPWP", accessor: d => d.npwp || "-" },
      { Header: "Nama Pajak", accessor: d => d.nama_pajak || "-" },
      { Header: "Alamat Pajak", accessor: d => d.alamat_pajak || "-" },
      { Header: "Status PTKP", accessor: d => d.status_ptkp || "-" },
      { Header: "Atas Nama Bank", accessor: d => d.atas_nama_bank || "-" },
      { Header: "Nama Bank", accessor: d => d.nama_bank || "-" },
      { Header: "No Rekening", accessor: d => d.no_rekening || "-" },
      { Header: "BPJSTK", accessor: d => d.bpjstk || "-" },
      { Header: "BPJSKIS", accessor: d => d.bpjskis || "-" }
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
        .values()
        .map((emp, index) => ({
          ...emp,
          orderNo: index + 1
        }))
        .value();
      mainContent = (
        <Fragment>
          <div>
            <ExportToExcel
              rows={data}
              headers={columns.map(col => col.Header)}
              accessors={columns.map(col => col.accessor)}
              plains={columns.map(col => col.plain)}
              filename="[HRIS] PPH Report"
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
                PPH Report
              </Typography>
              <br />
              {mainContent}
            </Paper>
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
    { ...employeesActions }
  ),
  hasRole("MASTER_DATA")
)(PphReportIndex);
