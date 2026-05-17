import http from "http";
import { player } from "./logger/players";

const server = http.createServer(
  (req: http.IncomingMessage, res: http.ServerResponse) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Hello, World!\n");
  },
);

player.log({
  id: crypto.randomUUID(),
  name: "huehuehuhue",
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000/");
});
