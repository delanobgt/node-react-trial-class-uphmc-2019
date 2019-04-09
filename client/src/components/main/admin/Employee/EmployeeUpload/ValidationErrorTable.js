import _ from "lodash";
import React from "react";
import { withStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";

const styles = theme => ({});

function ValidationErrorTable(props) {
  const { errorGrid } = props;

  const colAlphas = _.chain(errorGrid)
    .flatMap(v => _.keys(v))
    .uniq()
    .sortBy(
      v =>
        v.length * 100000 +
        _.reduce(v.split(""), (acc, v) => acc + v.charCodeAt(0), 0)
    )
    .value();

  return (
    <Paper elevation={3}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              Row <strong>/</strong> Col
            </TableCell>
            {colAlphas.map(colAlpha => (
              <TableCell align="center" key={colAlpha}>
                {colAlpha}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {_.chain(errorGrid)
            .map((cols, rowIndex) => ({ rowIndex, cols }))
            .sortBy(v => Number(v.rowIndex))
            .map(({ rowIndex, cols }) => (
              <TableRow key={rowIndex}>
                <TableCell align="center" component="th" scope="row">
                  {rowIndex}
                </TableCell>
                {colAlphas.map(colAlpha => (
                  <TableCell align="center" key={colAlpha}>
                    {cols[colAlpha] ? cols[colAlpha] : ""}
                  </TableCell>
                ))}
              </TableRow>
            ))
            .value()}
        </TableBody>
      </Table>
    </Paper>
  );
}

export default withStyles(styles)(ValidationErrorTable);
