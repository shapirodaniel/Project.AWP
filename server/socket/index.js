module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`A socket connection to the server has been made: ${socket.id}`)

    socket.on('disconnect', () => {
      console.log(`Connection ${socket.id} has left the building`)
    })

    socket.on('add-peer', (userId, roomId) => {
      console.log('hey im inside add-peer socket.on: ', userId, roomId)
      io.sockets.emit('dispatch-add-peer', userId, roomId)
    })

    socket.on('user-left', (userId) => {
      console.log('hey im inside user-left socket.on: ', userId)
      io.sockets.emit('dispatch-user-left', userId)
    })

    socket.on('new-peer', (data) => {
      console.log('hey im inside new-peer socket.on: ', data)
      socket.emit('add-new-peer', data)
    })
  })
}
