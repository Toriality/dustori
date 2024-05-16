export function configureChat(socket) {
  const messages = document.getElementById("messages");
  const sendMessageButton = document.getElementById("send");

  sendMessageButton.addEventListener("click", (e) => {
    e.preventDefault();
    const message = document.getElementById("message").value;
    socket.emit("sendMessage", message);
    document.getElementById("message").value = "";
  });

  socket.on("newMessage", (data) => {
    const new_message = document.createElement("p");
    const user = document.createElement("span");
    user.innerText = data.user.id + ": ";
    user.style.color = data.user.color;
    const message = document.createElement("span");
    message.innerText = data.message;
    new_message.appendChild(user);
    new_message.appendChild(message);
    messages.appendChild(new_message);
    messages.scrollTo(0, messages.scrollHeight);
  });
}
