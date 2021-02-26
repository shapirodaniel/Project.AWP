import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {fetchAddPeer, fetchRemovePeer} from '../store/rooms'
import CustomVideoElement from './custom-video'
import Chat from './chat'
import socket from '../socket'

/**
 * COMPONENT
 */
export class PeerManager extends React.Component {
  constructor(props) {
    super(props)

    /**
     * The Peer constructor below is served by peer.min.js
     * from public/index.html.
     *
     * It assigns a random ID if one isn't chosen,
     * which is why the first arg to new Peer() has
     * been declared as undefined.
     */

    this.self = new Peer(undefined, {
      host: 'localhost',
      port: 9000,
    })
  }

  handlePeerConnections() {
    const roomId = this.props.match.params.roomId

    /**
     * myStream is defined outside Peer event listeners
     * so that we can reuse it for sockets and Peer events
     */

    let myStream

    /**
     * On creation of this.self, myId is created --
     * we'll use it to initialize our local MediaStream
     * and add this.self to room.
     */

    this.self.on('open', async (myId) => {
      myStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      this.props.addStreamToRoom(roomId, this.self._id, myStream)

      /**
       * Here we let other participants know
       * we've joined the room.
       */

      socket.emit('add-peer', myId, roomId)
    })

    socket.on('dispatch-add-peer', (newUserId, newUserRoomId) => {
      /**
       * This if-check prevents us from adding
       * room participants if they're not in
       * our room.
       */

      if (newUserRoomId !== roomId) return

      const call = this.self.call(newUserId, myStream)

      /**
       * This if-check prevents TypeErrors
       * if peerStream isn't available.
       */

      if (call) {
        call.on('stream', (peerStream) => {
          this.props.addStreamToRoom(roomId, call.peer, peerStream)
        })
      }
    })

    this.self.on('call', (call) => {
      call.answer(myStream)

      /**
       * If this.self has an incoming call
       * FROM this.self, the if-check below
       * prevents us adding a duplicate stream
       * to our video display.
       */

      if (call.peer === this.self._id) {
        return
      }

      call.on('stream', (stream) => {
        this.props.addStreamToRoom(roomId, call.peer, stream)
      })

      call.on('close', () => {
        this.props.removeStreamFromRoom(roomId, call.peer)
      })
    })
  }

  componentDidMount() {
    this.handlePeerConnections()
  }

  componentDidUpdate() {
    /**
     * Listen for peer disconnections
     * to remove their dead stream
     * from video display.
     */

    const roomId = this.props.match.params.roomId

    socket.on('dispatch-user-left', (id) => {
      this.props.removeStreamFromRoom(roomId, id)
    })
  }

  componentWillUnmount() {
    /**
     * Here, we clean up streams from our room
     * so that we don't see dead streams if
     * we re-enter. We then call this.self.destroy()
     * which disconnects our peer instance from
     * peerserver, and let the serverside socket
     * connection know we've left so that
     * other room participants can remove our
     * newly-dead stream.
     */

    const roomId = this.props.match.params.roomId
    const myPeers = this.props.rooms[roomId].peers

    for (let key in myPeers) {
      // linter complains if no ownProps check ...
      if (myPeers[key] instanceof MediaStream) {
        this.props.removeStreamFromRoom(roomId, key)
      }
    }

    /**
     * Important! myId needs to be stored before calling
     * this.self.destroy() so that socket can broadcast
     * that we've left the room and other participants
     * can cleanup our dead stream.
     */

    const myId = this.self._id
    this.self.destroy()
    socket.emit('user-left', myId)
  }

  render() {
    const roomId = this.props.match.params.roomId

    const participants = Object.entries(this.props.rooms[roomId].peers)

    /**
     * Each participant in participants array
     * is a subarray: [ id, MediaStream ].
     */

    return (
      <div className="videoChat-container">
        <div id="video-display">
          {participants.map((participant) => {
            const [id] = participant
            return <CustomVideoElement key={id} id={id} roomId={roomId} />
          })}
        </div>
        <div id="chat-display">
          <Chat roomId={roomId} />
        </div>
      </div>
    )
  }
}

/**
 * CONTAINER
 */
const mapState = (state) => ({
  user: state.user,
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
  rooms: PropTypes.object.isRequired,
}
