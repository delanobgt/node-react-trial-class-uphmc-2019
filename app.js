require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const methodOverride = require("method-override");
const morgan = require("morgan");
const express = require("express");
const app = express();
const server = require("http").Server(app);
require("./services/socket").init(server);

// App Setup
app.use(
  morgan("combined", {
    skip: function(req, res) {
      return res.statusCode < 400;
    }
  })
);
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// Routes Setup
app.use((req, res, next) => {
  req.locals = {
    originUrl: req.get("origin"),
    hostUrl: `https://${req.get("host")}`
  };
  next();
});
app.use("/api/auth", require("./routes/auth"));
app.use("/api/configuration", require("./routes/configuration"));
app.use("/api/participants", require("./routes/participant"));
app.use("/api/users", require("./routes/user"));
app.use("/api/qrCode", require("./routes/qrCode"));

const path = require("path");
app.use(express.static(path.join("client", "build")));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
});

// Server Setup
const PORT = process.env.PORT || 3090;
server.listen(PORT, () => {
  console.log("\n\n\n");
  console.log(`Server listening on port ${PORT}.`);
  console.log("\n\n\n");
});
