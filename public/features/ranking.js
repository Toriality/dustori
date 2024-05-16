export function configureRanking(socket) {
  const rankingElement = document.getElementById("ranking");

  socket.on("showInfo", (data) => {
    fetchRanking(data.ranking);
  });

  socket.on("win", (data) => {
    fetchRanking(data.ranking);
  });

  socket.on("tableChanged", (data) => {
    rankingElement.innerHTML = "";
  });

  function fetchRanking(ranking) {
    rankingElement.innerHTML = "";
    ranking.forEach((data, index) => {
      const rankingP = document.createElement("p");
      const rankingNumber = document.createElement("span");
      const rankingUser = document.createElement("span");
      const rankingTime = document.createElement("span");

      rankingNumber.innerHTML = `${index + 1}.`;
      rankingUser.innerHTML = data.user.id;
      rankingTime.innerHTML = new Date(data.time).toLocaleTimeString();

      rankingP.className = "ranking_item";
      rankingP.style.color = data.user.color;

      rankingP.appendChild(rankingNumber);
      rankingP.appendChild(rankingUser);
      rankingP.appendChild(rankingTime);

      rankingElement.appendChild(rankingP);
    });
  }
}
