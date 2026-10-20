import { useEffect, useState } from "react";
import { socket } from "../../api/socket";
import { Events } from "../../socketEvents.js";

export function useGame(username) {
  const [connected, setConnected] = useState(false);
  const [boardId, setBoardId] = useState(-1);
  const [player, setPlayer] = useState(-1);
  const [enemySocketId, setEnemySocketId] = useState(-1);
  const [turn, setTurn] = useState(false);
  const [start, setStart] = useState(false);
  const [isRoom, setIsRoom] = useState(false);
  const [clicked, setClicked] = useState(new Set());
  const [btnValue, setBtnValue] = useState({});

  useEffect(() => {
    socket.on("connect", () => {
      setConnected(true);
      console.log("connect");
    });
    socket.on("disconnect", () => {
      setConnected(false);
      console.log("disconnect");
    });

    socket.on(Events.INVITED, (response) => {
      console.log("invited");
      const ok = window.confirm(`Вас приглашает в игру. Принять?`);
      if (ok) {
        setPlayer(2);
        setBoardId(response.boardId);
        setEnemySocketId(response.playerSocketId);

        socket.emit(Events.GAME_START, response.playerSocketId);
        setStart(true);
        setIsRoom(true);
      }
    });

    socket.on(Events.GAME_STARTED, (response) => {
      console.log("started");
      setTurn(true);
      setEnemySocketId(response.playerSocketId);
      setStart(response.start);
    });

    socket.on(Events.NEXT_TURNED, (response) => {
      console.log("turned");

      setTurn(true);
      setClicked((prev) => new Set(prev).add(response.cellId));
      setBtnValue((prev) => ({
        ...prev,
        [response.cellId]: response.player,
      }));

      if (response.isWin) {
        console.log("defeted");
        window.alert("Поражение");
        endGame();
      }
    });

    socket.on(Events.EXITED, () => {
      endGame();
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off(Events.INVITED);
      socket.off(Events.GAME_STARTED);
      socket.off(Events.NEXT_TURNED);
      socket.off(Events.EXITED);
    };
  }, []);

  const join = (onResult) => {
    console.log("join", username);
    socket.connect();
    socket.emit(Events.JOIN, username, (response) => {
      if (response.success) {
        onResult(true);
      } else {
        socket.disconnect();
        onResult(false);
        window.alert(`Пользователь с таким именем уже существует`);
      }
    });
  };

  const room = () => {
    console.log("room");
    socket.emit(Events.ROOM, (response) => {
      if (response.success) {
        setBoardId(response.boardId);
        setIsRoom(true);
        setPlayer(1);
      }
    });
  };

  const invite = (invitePlayer) => {
    console.log("invite");
    const name = invitePlayer?.trim();
    if (!name) {
      return;
    }
    socket.emit(Events.INVITE, name, boardId, (response) => {
      if (!response.success) {
        window.alert(`Пользователь не в сети`);
      }
    });
  };

  const exit = () => {
    endGame();

    socket.emit(Events.EXIT, boardId, enemySocketId);
  };

  const nextTurn = (cellId, isWin) => {
    console.log("nextTurn");
    setTurn(false);
    socket.emit(Events.NEXT_TURN, boardId, cellId, player, enemySocketId, isWin);
  };

  const onClick = (cellId) => {
    console.log("click");
    setClicked((prev) => new Set(prev).add(cellId));
    let nextBtnValue = { ...btnValue, [cellId]: player };
    setBtnValue(nextBtnValue);

    let win = checkWin(nextBtnValue);
    nextTurn(cellId, win);

    if (win) {
      console.log("win");
      window.alert("Победа!!!");
      endGame();
    }
  };

  const endGame = () => {
    console.log("endGame");
    setStart(false);
    setIsRoom(false);
    setTurn(false);
    setClicked(new Set());
    setBtnValue({});
  };

  const checkWin = (nextBtnValue) => {
    return (
      (nextBtnValue[1] === nextBtnValue[2] &&
        nextBtnValue[2] === nextBtnValue[3] &&
        !!nextBtnValue[3]) ||
      (nextBtnValue[7] === nextBtnValue[8] &&
        nextBtnValue[8] === nextBtnValue[9] &&
        !!nextBtnValue[9]) ||
      (nextBtnValue[1] === nextBtnValue[4] &&
        nextBtnValue[4] === nextBtnValue[7] &&
        !!nextBtnValue[7]) ||
      (nextBtnValue[3] === nextBtnValue[6] &&
        nextBtnValue[6] === nextBtnValue[9] &&
        !!nextBtnValue[9]) ||
      (nextBtnValue[1] === nextBtnValue[5] &&
        nextBtnValue[5] === nextBtnValue[9] &&
        !!nextBtnValue[9]) ||
      (nextBtnValue[3] === nextBtnValue[5] &&
        nextBtnValue[5] === nextBtnValue[7] &&
        !!nextBtnValue[7]) ||
      (nextBtnValue[2] === nextBtnValue[5] &&
        nextBtnValue[5] === nextBtnValue[8] &&
        !!nextBtnValue[8]) ||
      (nextBtnValue[4] === nextBtnValue[5] &&
        nextBtnValue[5] === nextBtnValue[6] &&
        !!nextBtnValue[6])
    );
  };

  return {
    connected,
    join,
    room,
    invite,
    player,
    nextTurn,
    exit,
    turn,
    start,
    isRoom,
    clicked,
    btnValue,
    onClick,
  };
}
