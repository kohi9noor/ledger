import { definePgTask, uuid, text } from "../../../src/index";

export const player = definePgTask(
  "player",
  "info",
  {
    id: uuid("player-id"),
    name: text("player-name"),
  },
  "optional message",
);
