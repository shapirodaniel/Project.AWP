const ADD_PEER = 'ADD_PEER'
const REMOVE_PEER = 'REMOVE_PEER'
const ADD_MESSAGE_TO_CHAT = 'ADD_MESSAGE_TO_CHAT'

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

const addMessageToChat = ({roomId, email, msgId, message}) => ({
  type: ADD_MESSAGE_TO_CHAT,
  roomId,
  email,
  msgId,
  message,
})

export const fetchAddPeer = (roomId, userId, stream) => (dispatch) => {
  dispatch(addPeer({roomId, userId, stream}))
}

export const fetchRemovePeer = (roomId, userId) => (dispatch) => {
  dispatch(removePeer({roomId, userId}))
}

export const fetchAddMessageToChat = (roomId, email, msgId, message) => (
  dispatch
) => {
  dispatch(addMessageToChat({roomId: roomId, email: email, [msgId]: message}))
}

// roomIds are red, blue
const rooms = {
  red: {
    id: 'red',
    peers: {},
    chat: {},
  },
  blue: {
    id: 'blue',
    peers: {},
    chat: {},
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
    case ADD_MESSAGE_TO_CHAT:
      return {
        ...state,
        [action.roomId]: {
          ...state[action.roomId],
          chat: {
            ...state[action.roomId].chat,
            [action.msgId]: action.message,
          },
        },
      }
    default:
      return state
  }
}
