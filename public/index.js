import { configureMouse } from "./features/mouse.js";
import { configureChat } from "./features/chat.js";
import { configureSettings } from "./features/settings.js";
import { configureTable } from "./features/table.js";
import { configureUsers } from "./features/users.js";
import { configureRanking } from "./features/ranking.js";

const socket = io();

configureMouse(socket);
configureChat(socket);
configureSettings(socket);
configureTable(socket);
configureUsers(socket);
configureRanking(socket);

socket.on("showInfo", (data) => {
  const gradient = document.getElementById("gradient");

  const c = data.me.color;
  gradient.style.background = `linear-gradient(90deg, ${c} 0%, transparent 5%,transparent 95%, ${c} 100%)`;
});
