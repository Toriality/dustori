export function configureUsers(socket) {
  const usersElement = document.getElementById("users");

  socket.on("showInfo", (data) => {
    data.users.forEach((user) => {
      createNewUserElement(user);
    });
  });

  socket.on("userJoined", (new_user) => {
    createNewUserElement(new_user);
  });

  socket.on("userLeft", (user_id) => {
    const el = document.getElementById(user_id);
    if (el) el.remove();
  });

  function createNewUserElement(user) {
    const userElement = document.createElement("div");
    userElement.id = user.id;
    userElement.style.backgroundColor = user.color;
    userElement.className = "user";

    const tooltip = document.createElement("span");
    tooltip.className = "tooltip";
    tooltip.innerText = user.id;
    userElement.appendChild(tooltip);

    usersElement.appendChild(userElement);
  }
}
