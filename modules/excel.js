const excel = require("exceljs");
const fs = require("fs");
const path = require("path");

module.exports.generateVoteTokenExcelStream = async voteTokens => {
  const workbook = new excel.Workbook();
  workbook.creator = "HMFIK UPH Medan Campus";
  workbook.lastModifiedBy = "HMFIK UPH Medan Campus";
  workbook.created = new Date();
  workbook.modified = new Date();
  var sheet = workbook.addWorksheet("Vote Tokens");
  var columns = [{ header: "Token", key: "value" }];
  sheet.columns = columns;
  voteTokens.forEach(voteToken => {
    sheet.addRow(voteToken);
  });
  const filePath = path.join(__dirname, "voteTokens.xlsx");
  await workbook.xlsx.writeFile(filePath);
  return fs.createReadStream(filePath);
};
