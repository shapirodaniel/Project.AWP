module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`A socket connection to the server has been made: ${socket.id}`)

    socket.on('disconnect', () => {
      console.log(`Connection ${socket.id} has left the building`)
    })

    socket.on('add-peer', (userId, roomId) => {
      io.sockets.emit('dispatch-add-peer', userId, roomId)
    })

    socket.on('user-left', (userId) => {
      io.sockets.emit('dispatch-user-left', userId)
    })

    socket.on('chat-message', (chatPayload) => {
      io.sockets.emit('dispatch-chat-message', chatPayload)
    })
  })
}
