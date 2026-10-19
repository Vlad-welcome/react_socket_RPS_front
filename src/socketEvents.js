export const Events = {
  // server → client
  INVITED: "game:invited",
  GAME_STARTED: "game:started",
  NEXT_TURNED: "game:next_turned",
  EXITED: "game:exited",

  // client → server
  JOIN: "user:join",
  ROOM: "game:room",
  INVITE: "game:invite",
  GAME_START: "game:start",
  NEXT_TURN: "game:next_turn",
  EXIT: "game:exit",
};
