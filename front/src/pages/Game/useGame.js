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
    });

    socket.on(Events.EXITED, () => {
      console.log("exited");
      setStart(false);
      setIsRoom(false);
      setTurn(false);
      setClicked(new Set());
      setBtnValue({});
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
      }
    });
  };

  const room = () => {
    console.log("room");
    socket.emit(Events.ROOM, (response) => {
      setBoardId(response.boardId);
    });
    setIsRoom(true);
    setPlayer(1);
  };

  const invite = (invitePlayer) => {
    console.log("invite");
    const name = invitePlayer?.trim();
    if (!name) {
      return;
    }
    socket.emit(Events.INVITE, name, boardId);
  };

  const exit = () => {
    console.log("exit");
    setStart(false);
    setIsRoom(false);
    setTurn(false);
    setClicked(new Set());
    setBtnValue({});

    socket.emit(Events.EXIT, boardId, enemySocketId);
  };

  const nextTurn = (cellId) => {
    console.log("nextTurn");
    setTurn(false);
    socket.emit(Events.NEXT_TURN, boardId, cellId, player, enemySocketId);
  };

  const onClick = (cellId) => {
    console.log("click");
    setClicked((prev) => new Set(prev).add(cellId));
    setBtnValue((prev) => ({
      ...prev,
      [cellId]: player,
    }));
    nextTurn(cellId);
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
