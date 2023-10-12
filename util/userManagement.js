const users = [];
const addUser = ({ id, room, name, host }) => {
  const user = {
    id,
    room,
    host,
    name,
  };

  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) return users.splice(index, 1)[0];
};

const getUserDetail = (id) => {
  return users.find((user) => user.id === id);
};

const getHostDetail = (room) => {
  return users.find((user) => user.room === room && user.host === true);
};

const getUsersInRoom = (room) => users.filter((user) => user.room === room);

module.exports = {
  addUser,
  removeUser,
  getUserDetail,
  getUsersInRoom,
  getHostDetail,
};
