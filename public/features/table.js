export function configureTable(socket) {
  const tableElement = document.getElementById("table");
  const title = document.getElementById("title");

  socket.on("showInfo", (data) => {
    createTableElement(data.table);
  });

  socket.on("win", (data) => {
    if (data.user.id === socket.id) {
      tableElement.classList.add("disabled");
    }

    const audio = new Audio("../win.wav");
    audio.play();
  });

  socket.on("tableChanged", (data) => {
    createTableElement(data);
    tableElement.classList.remove("disabled");
  });

  socket.on("cellChanged", (data) => {
    const query = `td[data-index="${data.index}"]`;

    if (data.mode === 2 && data.user.id !== socket.id) {
      const cellElement = document.querySelector(query);
      if (data.selected) {
        cellElement.classList.add("disabled");
      } else {
        cellElement.classList.remove("disabled");
      }
    }

    if (data.selected) addUserSquareToCell(document.querySelector(query), data.user);
    else removeUserSquareFromCell(document.querySelector(query), data.user);
  });

  function addUserSquareToCell(cellElement, user) {
    const userSquareWrapper = cellElement.querySelector(".user_square_wrapper");
    const userSquare = document.createElement("div");
    userSquare.className = "user_square";
    userSquare.style.backgroundColor = user.color;
    userSquare.id = `user-${user.id}`;
    userSquareWrapper.appendChild(userSquare);
  }

  function removeUserSquareFromCell(cellElement, user) {
    const userSquare = cellElement.querySelector(`#user-${user.id}`);
    return userSquare.remove();
  }

  function createTableElement(table) {
    console.log(table);
    tableElement.innerHTML = "";
    title.innerHTML = table.title;
    document.body.style.backgroundImage = `url(${table.bg})`;

    for (let i = 0; i < table.grid; i++) {
      const row = document.createElement("tr");
      for (let j = 0; j < table.grid; j++) {
        const cell = document.createElement("td");
        const index = i * table.grid + j;
        const serverCell = table.slots[index];
        cell.innerHTML = `<p>${serverCell.name}</p>` || "";
        cell.dataset.index = index;
        cell.addEventListener("click", () => {
          socket.emit("cellClicked", index);
        });
        const userSquareWrapper = document.createElement("div");
        userSquareWrapper.className = "user_square_wrapper";
        cell.appendChild(userSquareWrapper);
        if (serverCell.users_selected) {
          for (const user of serverCell.users_selected) {
            addUserSquareToCell(cell, user);
          }
        }
        row.appendChild(cell);
      }
      tableElement.appendChild(row);
    }
  }
}
