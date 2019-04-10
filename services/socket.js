const _ = require("lodash");
const db = require("../models");

class Socket {
  static init(server) {
    this.identifiedSockets = {};

    if (this.io) this.close();
    this.io = require("socket.io")(server);

    this.globalSocket = this.io.of("globalSocket");

    this.globalSocket.on("connection", async socket => {
      const userId = _.get(socket, "handshake.query.userId", null);

      // set connected to true
      try {
        const user = await db.User.findByIdAndUpdate(userId, {
          $set: { connected: true }
        });
        this.globalSocket.emit("SELF_PROFILE_GET", { id: userId });
        this.globalSocket.emit("USER_GET_BY_ID", { id: userId });
        console.log(`Socket connected to user ${user.email}.`);
      } catch (error) {
        // console.log({ error });
      }

      socket.on("disconnect", async () => {
        // set connected to false
        try {
          const user = await db.User.findByIdAndUpdate(userId, {
            $set: { connected: false }
          });
          this.globalSocket.emit("USER_GET_BY_ID", { id: userId });
          console.log(`Socket disconnected with user ${user.email}.`);
        } catch (error) {
          console.log({ error });
        }
      });
    });

    this.io.of("identifiedSockets").on("connection", socket => {
      this.identifiedSockets[socket.id] = socket;
      socket.on("disconnect", () => {
        this.identifiedSockets = _.omit(this.identifiedSockets, socket.id);
      });
      socket.emit("ready");
    });
  }

  static close() {
    if (this.io) this.io.close();
  }
}

module.exports = Socket;
