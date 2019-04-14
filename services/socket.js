const _ = require("lodash");
const db = require("../models");

class Socket {
  static init(server) {
    this.identifiedSockets = {};
    this.userSockets = {};

    if (this.io) this.close();
    this.io = require("socket.io")(server);

    this.globalSocket = this.io.of("globalSocket");

    this.globalSocket.on("connection", async socket => {
      const userId = _.get(socket, "handshake.query.userId", null);

      if (!this.userSockets[userId]) this.userSockets[userId] = [];

      if (this.userSockets[userId].length === 0) {
        // set connected to true
        try {
          const user = await db.User.findByIdAndUpdate(userId, {
            $set: { connected: true }
          });
          socket.emit("SELF_PROFILE_GET");
          this.globalSocket.emit("USER_GET_BY_ID", { id: userId });
          console.log(`Socket connected to user ${user.email}.`);
        } catch (error) {
          // console.log({ error });
        }
      }
      this.userSockets[userId].push(socket);

      socket.on("disconnect", async () => {
        this.userSockets[userId] = this.userSockets[userId].filter(
          userSocket => userSocket.id !== socket.id
        );
        if (this.userSockets[userId].length === 0) {
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
