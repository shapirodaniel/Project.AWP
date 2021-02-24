import axios from 'axios'
import history from '../history'

const ADD_ROOM = 'ADD_ROOM'
const REMOVE_ROOM = 'REMOVE_ROOM'

const ADD_PEER = 'ADD_PEER'
const REMOVE_PEER = 'REMOVE_PEER'

const addPeer = (userId, stream) => ({
  type: ADD_PEER,
  userId,
  stream,
})

const removePeer = (userId) => ({
  type: REMOVE_PEER,
  userId,
})

// thunks
export const fetchAddPeer = (userId, stream) => async (dispatch) => {
  try {
    dispatch(addPeer(userId, stream))
  } catch (err) {
    console.error(err)
  }
}

const initState = {
  roomId: {
    peers: {},
  },
}

export default (state = initState, action) => {
  switch (action.type) {
    case ADD_PEER:
      return {
        ...state,
        peers: {
          ...state.peers,
          [action.userId]: action.stream,
        },
      }
    case REMOVE_PEER:
      const updatedPeers = state.peers
      delete updatedPeers[action.userId]
      return {
        ...state,
        peers: updatedPeers,
      }
    default:
      return state
  }
}
