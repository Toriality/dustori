export const configureSettings = (socket) => {
  const settingsElement = document.getElementById("settings");
  const importSlotsButton = document.getElementById("import_slots");
  const exportSlotsButton = document.getElementById("export_slots");
  const importFile = document.getElementById("import_file");
  const slotsElement = document.getElementById("slots");
  const addSlotsButton = document.getElementById("add_slot");
  const slot_name = document.getElementById("slot_name");
  const grid = document.getElementById("grid");
  const title = document.getElementById("input_title");
  const bgElement = document.getElementById("bg_image");
  const bgFile = document.getElementById("bg_file");

  const title_value = localStorage.getItem("title") || title.value;
  const grid_value = localStorage.getItem("grid") || grid.value;
  const slots_value = JSON.parse(localStorage.getItem("slots")) || [];

  title.value = title_value;
  grid.value = grid_value;
  for (const slot of slots_value) {
    createSlot(slot, true);
  }

  const new_table = {
    title: title_value,
    bg: null,
    grid: parseInt(grid_value),
    mode: 1,
    slots: slots_value,
  };

  settingsElement.addEventListener("submit", (e) => {
    e.preventDefault();
    new_table.mode = parseInt(
      document.querySelector('input[name="gamemode"]:checked').value
    );
    socket.emit("tableChanged", new_table);
  });

  bgElement.addEventListener("click", (e) => {
    e.preventDefault();
    bgFile.click();
  });

  bgFile.addEventListener("change", () => {
    const file = bgFile.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.addEventListener("load", () => {
      const img = bgElement.querySelector("img");
      img.src = reader.result;
      new_table.bg = reader.result;
    });
  });

  grid.addEventListener("change", () => {
    new_table.grid = grid.value;
    localStorage.setItem("grid", grid.value);
  });

  title.addEventListener("change", () => {
    new_table.title = title.value;
    localStorage.setItem("title", title.value);
  });

  importSlotsButton.addEventListener("click", (e) => {
    e.preventDefault();
    importFile.click();
  });

  exportSlotsButton.addEventListener("click", (e) => {
    e.preventDefault();
    const file = new Blob([JSON.stringify(new_table.slots)], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(file);
    a.download = title.value;
    a.click();
  });

  importFile.addEventListener("change", () => {
    const file = importFile.files[0];
    if (!file) return;
    slotsElement.innerHTML = "";
    const reader = new FileReader();
    reader.readAsText(file);
    reader.addEventListener("load", () => {
      const file_slots = JSON.parse(reader.result);
      file_slots.forEach((slot) => {
        createSlot(slot);
      });
    });
  });

  addSlotsButton.addEventListener("click", (e) => {
    e.preventDefault();
    if (slot_name.value.length < 1) return;
    createSlot(slot_name.value);
  });

  function createSlot(slot, initMode = false) {
    const new_slot = document.createElement("div");

    new_slot.className = "slot";
    new_slot.innerHTML = slot;

    new_slot.addEventListener("click", () => {
      new_slot.remove();
      new_table.slots = new_table.slots.filter((s) => s !== slot);
      localStorage.setItem("slots", JSON.stringify(new_table.slots));
    });

    slotsElement.appendChild(new_slot);

    if (!initMode) {
      new_table.slots.push(slot);
      localStorage.setItem("slots", JSON.stringify(new_table.slots));
    }

    slot_name.value = "";
  }
};
