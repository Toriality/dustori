export function configureMouse(socket) {
  document.addEventListener("mousemove", (e) => {
    const { pageX: x, pageY: y } = e;
    socket.emit("mouseMove", { x, y });
  });

  socket.on("moving", (data) => {
    const cursor = document.createElement("div");
    cursor.className = "cursor";
    cursor.style.left = `${data.x}px`;
    cursor.style.top = `${data.y}px`;
    cursor.style.backgroundColor = `#${data.color}`;
    document.body.appendChild(cursor);
    setTimeout(() => {
      document.body.removeChild(cursor);
    }, 100);
  });
}
