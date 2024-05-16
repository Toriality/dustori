const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const path = require("path");
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const colors = [
  "red",
  "green",
  "blue",
  "yellow",
  "cyan",
  "magenta",
  "orange",
  "purple",
  "antiquewhite",
  "aqua",
  "aquamarine",
  "beige",
  "blueviolet",
  "chocolate",
  "coral",
  "crimson",
  "greenyellow",
  "hotpink",
  "indigo",
  "khaki",
  "lavender",
  "lightblue",
  "lightcoral",
  "lightcyan",
  "lightgreen",
  "lightpink",
  "wheat",
  "thistle",
  "tan",
  "springgreen",
];

let users = [];
let table = {
  mode: 1,
  grid: 2,
  title: "Sample Text",
  slots: [
    {
      index: 0,
      name: "Slot 1",
      users_selected: [],
    },
    {
      index: 1,
      name: "Slot 2",
      users_selected: [],
    },
    {
      index: 2,
      name: "Slot 3",
      users_selected: [],
    },
    {
      index: 3,
      name: "Slot 4",
      users_selected: [],
    },
  ],
  bg: null,
};
let ranking = [];

io.on("connection", (socket) => {
  const user = createNewUser(socket.id);

  socket.on("disconnect", () => {
    removeUser(socket.id);
    table.slots.forEach((slot) => {
      // slot.users_selected = slot.users_selected.filter((u) => u.id !== user.id);
      if (slot.users_selected.find((u) => u.id === socket.id)) {
        slot.users_selected = slot.users_selected.filter((u) => u.id !== socket.id);
        slot.locked = false;
      }
    });
    io.emit("userLeft", socket.id);
    io.emit("newMessage", {
      user: {
        id: "Server",
        color: "black",
      },
      message: `${user.id} left the room`,
    });
    io.emit("tableChanged", table);
  });

  socket.on("mouseMove", (data) => {
    socket.broadcast.emit("moving", { ...data, color: user.color });
  });

  socket.on("tableChanged", (data) => {
    if (!data.title || !data.grid || !data.slots.length)
      return console.log("invalid data");
    if (data.slots.length < data.grid ** 2)
      return console.log("not enough slots selected");

    console.log(data);

    const slots = [];

    for (let i = 0; i < data.grid ** 2; i++) {
      const randomSlotName = data.slots[Math.floor(Math.random() * data.slots.length)];

      data.slots = data.slots.filter((slot) => slot !== randomSlotName);

      slots.push({
        index: i,
        name: randomSlotName,
        locked: false,
        users_selected: [],
      });
    }

    table = {
      mode: data.mode,
      title: data.title,
      grid: data.grid,
      slots: slots,
      bg: data.bg,
    };

    ranking = [];

    io.emit("tableChanged", table);
    io.emit("newMessage", {
      user: {
        id: "Server",
        color: "black",
      },
      message: `${user.id} changed the table`,
    });
  });

  socket.on("sendMessage", (message) => {
    io.emit("newMessage", {
      user: user,
      message: message,
    });
  });

  socket.on("cellClicked", (index) => {
    const cell = table.slots[index];
    let selected = cell.users_selected.some((u) => u.id === user.id);

    if (cell.locked && !selected) return;

    if (selected) {
      cell.users_selected = cell.users_selected.filter((u) => u.id !== user.id);
      if (table.mode === 2) {
        cell.locked = false;
      }
    } else {
      cell.users_selected.push(user);
      if (table.mode === 2) {
        cell.locked = true;
      }
    }

    io.emit("cellChanged", { index, selected: !selected, mode: table.mode, user });

    if (checkWin(user)) {
      const date = new Date();
      ranking.push({ user: user, time: date.getTime() });

      io.emit("win", { user: user, ranking: ranking });
      io.emit("newMessage", {
        user: {
          id: "server",
          color: "black",
        },
        message: `${user.id} just won!`,
      });
    }
  });

  function checkWin(user) {
    // Bingo-like check

    for (let i = 0; i < table.grid; i++) {
      const row = table.slots.slice(i * table.grid, i * table.grid + table.grid);
      if (row.every((cell) => cell.users_selected.some((u) => u.id === user.id))) {
        return true;
      }
    }

    for (let i = 0; i < table.grid; i++) {
      const column = [];
      for (let j = 0; j < table.grid; j++) {
        column.push(table.slots[j * table.grid + i]);
      }

      if (column.every((cell) => cell.users_selected.some((u) => u.id === user.id))) {
        return true;
      }
    }

    // Check main diagonal (top-left to bottom-right)
    const mainDiagonal = [];
    for (let i = 0; i < table.grid; i++) {
      mainDiagonal.push(table.slots[i * table.grid + i]);
    }
    if (mainDiagonal.every((cell) => cell.users_selected.some((u) => u.id === user.id))) {
      return true;
    }

    // Check anti-diagonal (top-right to bottom-left)
    const antiDiagonal = [];
    for (let i = 0; i < table.grid; i++) {
      antiDiagonal.push(table.slots[i * table.grid + (table.grid - 1 - i)]);
    }
    if (antiDiagonal.every((cell) => cell.users_selected.some((u) => u.id === user.id))) {
      return true;
    }

    return false;
  }

  socket.emit("showInfo", { users, table, ranking, me: user });

  socket.broadcast.emit("userJoined", user);
  io.emit("newMessage", {
    user: {
      id: "server",
      color: "black",
    },
    message: `${user.id} joined the room`,
  });
});

function createNewUser(id) {
  const available_colors = colors.filter((c) => !users.some((u) => u.color === c));
  const color = available_colors[Math.floor(Math.random() * available_colors.length)];
  const user = {
    id: id,
    color: color,
  };

  users.push(user);

  return user;
}

function removeUser(id) {
  users = users.filter((user) => user.id !== id);
}

server.listen(3000, () => {
  console.log("listening on *:3000");
});
