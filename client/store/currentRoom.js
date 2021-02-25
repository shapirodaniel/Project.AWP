const SET_CURRENT_ROOM = 'SET_CURRENT_ROOM'

const setCurrentRoom = (roomId) => ({
  type: SET_CURRENT_ROOM,
  roomId,
})

export const fetchSetCurrentRoom = (roomId) => (dispatch) => {
  dispatch(setCurrentRoom(roomId))
}

const currentRoom = ''

export default (state = currentRoom, action) => {
  switch (action.type) {
    case SET_CURRENT_ROOM:
      return action.roomId
    default:
      return state
  }
}
