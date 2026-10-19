import { useState } from "react";
import { useGame } from "./useGame.js";
import { Button, Form, InputGroup } from "react-bootstrap";

export const Game = () => {
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [invitePlayer, setInvitePlayer] = useState("");

  const game = useGame(username);

  const onJoin = () => {
    if (!username.trim()) return;
    game.join((res) => setJoined(res));
  };

  const onBoard = () => {
    game.room();
  };

  const onInvite = () => {
    game.invite(invitePlayer);
  };

  const onExit = () => {
    game.exit();
  };

  const onClick = (id) => {
    game.onClick(id);
  };

  if (!joined) {
    return (
      <div className="d-flex justify-content-center mt-3 mx-3">
        <InputGroup>
          <Form.Control
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onJoin()}
            placeholder="Ваше имя"
          />
          <Button variant="outline-primary" onClick={onJoin}>
            Войти
          </Button>
        </InputGroup>
      </div>
    );
  } else if (!game.isRoom) {
    return (
      <div className="d-flex justify-content-center mt-3">
        <Button variant="primary" onClick={onBoard}>
          Создать комнату
        </Button>
      </div>
    );
  } else if (game.start) {
    return (
      <div className="d-flex min-vh-100 justify-content-center align-items-center">
        <div>
          <div className="d-flex justify-content-center">
            <h3>{!game.turn ? "Ожидайте" : "Ходите"}</h3>
          </div>
          <div className="d-flex flex-column gap-2 align-items-start">
            {[0, 1, 2].map((row) => (
              <div key={row} className="d-flex gap-2">
                {[1, 2, 3].map((col) => {
                  const id = row * 3 + col;
                  const isClicked = game.clicked.has(id);
                  return (
                    <Button
                      key={id}
                      variant={
                        isClicked
                          ? game.btnValue[id] === 1
                            ? "success"
                            : "danger"
                          : game.player === 1
                            ? "outline-success"
                            : "outline-danger"
                      }
                      size="lg"
                      disabled={isClicked || !game.turn}
                      onClick={() => onClick(id)}
                    >
                      {id}
                    </Button>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="d-flex justify-content-center mt-2">
            <Button variant="danger" onClick={onExit}>
              Выйти
            </Button>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="d-flex justify-content-center mt-3 mx-3">
        <InputGroup>
          <Form.Control
            type="text"
            value={invitePlayer}
            onChange={(e) => setInvitePlayer(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onInvite()}
            placeholder="Имя игрока"
          />
          <Button variant="outline-primary" onClick={onInvite}>
            Пригласить
          </Button>
          <Button variant="outline-danger" onClick={onExit}>
            Выйти
          </Button>
        </InputGroup>
      </div>
    );
  }
};
