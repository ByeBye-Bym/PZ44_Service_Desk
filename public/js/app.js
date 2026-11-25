const form = document.querySelector("#ticket-form");
const list = document.querySelector("#ticket-list");
const status = document.querySelector("#status");
const summary = document.querySelector("#summary");
const refreshButton = document.querySelector("#refresh-button");
const sendButton = document.querySelector("#send-button");
function setStatus(text, kind = "info") {
  status.textContent = text;
  status.dataset.kind = kind;
}
function renderTickets(items) {
  // TODO 1: очистите list и создайте карточку каждого обращения через createElement/textContent.
  // В карточке нужны номер #id, имя, текст проблемы и статус.
  list.replaceChildren();

  if (items.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "Обращений пока нет";
    list.append(empty);
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "item";

    const title = document.createElement("h3");
    title.textContent = "Заявка #" + item.id;

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = item.customer;

    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = item.status;

    const problem = document.createElement("p");
    problem.textContent = item.problem;

    card.append(title, meta, chip, problem);
    list.append(card);
  });
}
async function loadTickets() {
  // TODO 2: GET /api/tickets → проверка response.ok → response.json() → renderTickets(data.items).
  // Отобразите data.total в #summary; ошибки покажите через setStatus().
  setStatus("Загружаем обращения...", "loading");

  try {
    const response = await fetch("/api/tickets");

    if (!response.ok) {
      throw new Error("Сервер вернул код " + response.status);
    }

    const data = await response.json();
    renderTickets(data.items);
    summary.textContent = "Всего обращений: " + data.total;
    setStatus("Список обновлён.", "success");
  } catch (error) {
    setStatus("Не удалось загрузить список: " + error.message, "error");
  }
}
async function createTicket(payload) {
  // TODO 3: POST /api/tickets с заголовком Content-Type: application/json.
  // Передайте JSON.stringify(payload); проверьте код ответа и прочитайте JSON.
  const response = await fetch("/api/tickets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Сервер отклонил заявку");
  }

  return data;
}
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  // TODO 4: проверьте данные, отключите sendButton на период запроса,
  // вызовите createTicket(), очистите поля после успеха и обновите список через GET.
  const customer = document.querySelector("#customer").value.trim();
  const problem = document.querySelector("#problem").value.trim();

  if (customer.length < 2 || problem.length < 5) {
    setStatus("Укажите имя и описание проблемы подлиннее.", "error");
    return;
  }

  sendButton.disabled = true;
  setStatus("Отправляем заявку...", "loading");

  try {
    const data = await createTicket({ customer, problem });
    form.reset();
    await loadTickets();
    setStatus(data.message || "Заявка создана.", "success");
  } catch (error) {
    setStatus("Ошибка отправки: " + error.message, "error");
  } finally {
    sendButton.disabled = false;
  }
});
refreshButton.addEventListener("click", loadTickets);
// TODO 5: вызовите loadTickets() при загрузке страницы.
loadTickets();
