module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`A socket connection to the server has been made: ${socket.id}`)

    socket.on('disconnect', () => {
      console.log(`Connection ${socket.id} has left the building`)
    })

    socket.on('add-peer', (userId) => {
      console.log('hey im inside add-peer socket.on: ', userId)
      io.sockets.emit('dispatch-add-peer', userId)
    })

    socket.on('new-peer', (data) => {
      console.log('hey im inside new-peer socket.on: ', data)
      socket.emit('add-new-peer', data)
    })
  })
}
