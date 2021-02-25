import socket from '../socket'

const ADD_PEER = 'ADD_PEER'
const REMOVE_PEER = 'REMOVE_PEER'

export const addPeer = ({roomId, userId, stream}) => ({
  type: ADD_PEER,
  roomId,
  userId,
  stream,
})

export const removePeer = ({roomId, userId}) => ({
  type: REMOVE_PEER,
  roomId,
  userId,
})

export const fetchAddPeer = (roomId, userId, stream) => (dispatch) => {
  dispatch(addPeer({roomId, userId, stream}))
  // socket.emit('add-peer', {roomId, userId, stream})
}

export const fetchRemovePeer = (roomId, userId) => (dispatch) => {
  dispatch(removePeer({roomId, userId}))
  // socket.emit('remove-peer', {roomId, userId})
}

// roomIds are red, blue
const rooms = {
  red: {
    id: 'red',
    peers: {},
  },
  blue: {
    id: 'blue',
    peers: {},
  },
}

export default (state = rooms, action) => {
  switch (action.type) {
    case ADD_PEER:
      return {
        ...state,
        [action.roomId]: {
          ...state[action.roomId],
          peers: {
            ...state[action.roomId].peers,
            [action.userId]: action.stream,
          },
        },
      }
    case REMOVE_PEER:
      let updatedPeers = {...state[action.roomId].peers}
      delete updatedPeers[action.userId]
      return {
        ...state,
        [action.roomId]: {
          ...state[action.roomId],
          peers: updatedPeers,
        },
      }
    default:
      return state
  }
}
