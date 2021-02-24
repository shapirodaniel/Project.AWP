import io from 'socket.io-client'

const socket = io(window.location.origin)

socket.on('connect', () => {
  console.log('Connected!')
})

socket.on('user-connected', (roomId, userId) => {
  // add user to room so that
  // peer-manager hoc can pull it down from redux
})

socket.on('user-disconnected', (userId) => {
  // remove user from all rooms
  // redux will allow peer-managers to update
  // their displays
})

export default socket
