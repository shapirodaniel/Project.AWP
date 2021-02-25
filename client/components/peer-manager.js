import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {
  addPeer,
  removePeer,
  fetchAddPeer,
  fetchRemovePeer,
} from '../store/rooms'
import CustomVideoElement from './custom-video'
import socket from '../socket'
import store from '../store'

/**
 * COMPONENT
 */
export class PeerManager extends React.Component {
  constructor(props) {
    super(props)

    // peer.min.js served from public/index.html
    // the Peer constructor assigns a random ID if
    // one isn't chosen, which is why we've left
    // the first argument undefined
    this.self = new Peer(undefined, {
      host: 'localhost',
      port: 9000,
    })
  }

  componentDidMount() {
    const roomId = this.props.match.params.roomId
    let myStream

    this.self.on('open', async (myId) => {
      myStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      socket.emit('add-peer', myId)

      await this.props.addStreamToRoom(roomId, myId, myStream)

      socket.on('dispatch-add-peer', async (newUserId) => {
        console.log(
          'this is add-peer data bounced back from server: ',
          newUserId
        )
        const call = await this.self.call(newUserId, myStream)
        store.dispatch(
          addPeer({
            roomId: roomId,
            userId: call.peer,
            stream: call._localStream,
          })
        )
      })
    })

    this.self.on('call', (call) => {
      console.log('this is call received from another user, ', call)
      call.answer(myStream)
      if (call.peer === this.self._id) return
      call.on('stream', () => {
        store.dispatch(
          addPeer({
            roomId: roomId,
            userId: call.peer,
            stream: call._localStream,
          })
        )
      })
    })
  }

  componentWillUnmount() {
    const roomId = this.props.match.params.roomId
    const userId = this.self._id
    this.props.removeStreamFromRoom(roomId, userId)
  }

  render() {
    const participants = Object.entries(
      this.props.rooms[this.props.match.params.roomId].peers
    ).filter((peer) => peer.userId !== this.self._id)

    return (
      <div id="video-display">
        {participants.map((participant) => {
          const [id] = participant
          return <CustomVideoElement key={id} id={id} />
        })}
      </div>
    )
  }
}

/**
 * CONTAINER
 */
const mapState = (state) => ({
  rooms: state.rooms,
})

const mapDispatch = (dispatch) => ({
  addStreamToRoom: (roomId, userId, stream) =>
    dispatch(fetchAddPeer(roomId, userId, stream)),
  removeStreamFromRoom: (roomId, userId) =>
    dispatch(fetchRemovePeer(roomId, userId)),
})

export default connect(mapState, mapDispatch)(PeerManager)

/**
 * PROP TYPES
 */
PeerManager.propTypes = {
  // room needs to have at least name, port associated with it
  // because there will need to be a different Peer instance
  // listening to each room
  rooms: PropTypes.object.isRequired,
}
