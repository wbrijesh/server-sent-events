const HtmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Hono SSE Demo</title>
<script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-neutral-800 text-gray-100">
<h1 class="text-3xl font-bold text-center my-8">Hono Server-Sent Events (SSE) Demo</h1>
<div class="flex justify-center mb-4">
  <button id="connect-btn" class="px-4 py-2 bg-green-500 text-white rounded mr-2">Connect to SSE</button>
  <button id="disconnect-btn" class="px-4 py-2 bg-red-500 text-white rounded" disabled>Disconnect</button>
  <span id="status-indicator" class="ml-4 px-4 py-2 rounded font-bold bg-red-100 text-red-700">Disconnected</span>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
  <div class="event-box p-4 bg-neutral-700 rounded shadow">
    <div class="event-title text-xl font-semibold mb-2">Time Updates</div>
    <div id="time-log" class="event-log h-64 overflow-y-auto border p-2 bg-neutral-900 border-neutral-500"></div>
  </div>
  <div class="event-box p-4 bg-neutral-700 rounded shadow">
    <div class="event-title text-xl font-semibold mb-2">Counter Updates</div>
    <div id="counter-log" class="event-log h-64 overflow-y-auto border p-2 bg-neutral-900 border-neutral-500"></div>
  </div>
  <div class="event-box p-4 bg-neutral-700 rounded shadow">
    <div class="event-title text-xl font-semibold mb-2">Random Data</div>
    <div id="random-log" class="event-log h-64 overflow-y-auto border p-2 bg-neutral-900 border-neutral-500"></div>
  </div>
  <div class="event-box p-4 bg-neutral-700 rounded shadow">
    <div class="event-title text-xl font-semibold mb-2">All Events</div>
    <div id="all-events" class="event-log h-64 overflow-y-auto border p-2 bg-neutral-900 border-neutral-500"></div>
  </div>
</div>
<script>
  let eventSource = null;
  const connectBtn = document.getElementById("connect-btn");
  const disconnectBtn = document.getElementById("disconnect-btn");
  const statusIndicator = document.getElementById("status-indicator");
  const timeLog = document.getElementById("time-log");
  const counterLog = document.getElementById("counter-log");
  const randomLog = document.getElementById("random-log");
  const allEvents = document.getElementById("all-events");
  function formatTime() {
    const now = new Date();
    return now.toLocaleTimeString();
  }
  function addEntry(container, message) {
    const entry = document.createElement("div");
    entry.classList.add("entry");
    entry.innerHTML = "<span class='entry-time'>[" + formatTime() + "]</span> " + message;
    container.prepend(entry);
  }
  function connect() {
    if (eventSource) {
      eventSource.close();
    }
    eventSource = new EventSource("/api/events");
    eventSource.onopen = function() {
      statusIndicator.textContent = "Connected";
      statusIndicator.classList.remove("bg-red-100", "text-red-700");
      statusIndicator.classList.add("bg-green-100", "text-green-700");
      connectBtn.disabled = true;
      disconnectBtn.disabled = false;
      addEntry(allEvents, "<b>Connection opened</b>");
    };
    eventSource.onerror = function(error) {
      statusIndicator.textContent = "Error/Disconnected";
      statusIndicator.classList.remove("bg-green-100", "text-green-700");
      statusIndicator.classList.add("bg-red-100", "text-red-700");
      addEntry(allEvents, "<b>Connection error or closed</b>");
      connectBtn.disabled = false;
      disconnectBtn.disabled = true;
    };
    eventSource.addEventListener("time-update", function(event) {
      const data = event.data;
      addEntry(timeLog, data);
      addEntry(allEvents, "<b>TIME:</b> " + data);
    });
    eventSource.addEventListener("counter", function(event) {
      const data = JSON.parse(event.data);
      addEntry(counterLog, "Counter: " + data.count);
      addEntry(allEvents, "<b>COUNTER:</b> " + data.count);
    });
    eventSource.addEventListener("random-data", function(event) {
      const data = JSON.parse(event.data);
      addEntry(randomLog, "Random value: " + data.random);
      addEntry(allEvents, "<b>RANDOM:</b> " + data.random);
    });
    eventSource.addEventListener("error", function(event) {
      const data = event.data;
      addEntry(allEvents, "<b>ERROR:</b> " + data);
    });
  }
  function disconnect() {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
      statusIndicator.textContent = "Disconnected";
      statusIndicator.classList.remove("bg-green-100", "text-green-700");
      statusIndicator.classList.add("bg-red-100", "text-red-700");
      connectBtn.disabled = false;
      disconnectBtn.disabled = true;
      addEntry(allEvents, "<b>Connection closed</b>");
    }
  }
  connectBtn.addEventListener("click", connect);
  disconnectBtn.addEventListener("click", disconnect);
</script>
</body>
</html>
`;

export default HtmlContent;
