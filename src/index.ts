import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import HtmlContent from "./html-string";

const app = new Hono();
let id = 0;

app.get("/", async (c) => {
  return c.html(HtmlContent);
});

app.get("/api/events", async (c) => {
  console.log("Client connected to SSE stream");

  return streamSSE(
    c,
    async (stream) => {
      stream.onAbort(() => {
        console.log("Client disconnected from SSE stream");
      });

      let counter = 0;

      while (true) {
        // Regular time updates
        const timeMessage = `Current time: ${new Date().toISOString()}`;
        await stream.writeSSE({
          data: timeMessage,
          event: "time-update",
          id: String(id++),
        });

        // Counter updates every 2 seconds
        if (counter % 2 === 0) {
          await stream.writeSSE({
            data: JSON.stringify({ count: counter }),
            event: "counter",
            id: String(id++),
          });
        }

        // Random data every 5 seconds
        if (counter % 5 === 0) {
          const randomValue = Math.floor(Math.random() * 100);
          await stream.writeSSE({
            data: JSON.stringify({ random: randomValue }),
            event: "random-data",
            id: String(id++),
          });
        }

        counter++;
        await stream.sleep(1000);
      }
    },
    async (err, stream) => {
      console.error("Error in SSE stream:", err);
      await stream.writeSSE({
        data: "An error occurred in the SSE stream",
        event: "error",
        id: String(id++),
      });
    },
  );
});

console.log('Hono SSE demo running at http://localhost:3000');

export default app;
