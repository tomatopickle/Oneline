async function createRoom() {
  // we'll add 30 min expiry (exp) so rooms won't linger too long on your account
  // we'll also turn on chat (enable_chat)
  // see other available options at https://docs.daily.co/reference#create-room
  // This endpoint is using the proxy as outlined in netlify.toml
  const response = await fetch(`https://Oneline-Functions.abaanshanid.repl.co/meetings/rooms`, {
    method: "POST",
  });
  const room = await response.json();
  console.log(room);
  return room;
}

export default {
  createRoom,
};
