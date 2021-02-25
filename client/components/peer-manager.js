import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {addPeer, fetchAddPeer, fetchRemovePeer} from '../store/rooms'
import CustomVideoElement from './custom-video'
import socket from '../socket'
import store from '../store'

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
    let myStream

    this.self.on('open', async (myId) => {
      myStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      store.dispatch(
        addPeer({roomId: roomId, userId: this.self._id, stream: myStream})
      )

      socket.emit('add-peer', myId)

      socket.on('dispatch-add-peer', (newUserId) => {
        console.log(
          'this is add-peer data bounced back from server: ',
          newUserId
        )
        const call = this.self.call(newUserId, myStream)

        if (call) {
          call.on('stream', (stream) => {
            console.log(call)

            /* Directly dispatch peer connections
            when this.self calls peers. */

            store.dispatch(
              addPeer({
                roomId: roomId,
                userId: call.peer,
                stream: stream,
              })
            )
          })
        }
      })
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
        console.log('skipping duplicate!')
        return
      }

      call.on('stream', (stream) => {
        /**
         * Directly dispatch peer connections
         * when peers call this.self.
         */

        store.dispatch(
          addPeer({
            roomId: roomId,
            userId: call.peer,
            stream: stream,
          })
        )
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
      if (myPeers[key] instanceof MediaStream)
        this.props.removeStreamFromRoom(roomId, key)
    }

    const id = this.self._id

    this.self.destroy()

    socket.emit('user-left', id)
  }

  render() {
    const roomId = this.props.match.params.roomId

    const participants = Object.entries(this.props.rooms[roomId].peers)

    return (
      <div id="video-display">
        {participants.map((participant) => {
          const [id] = participant
          return <CustomVideoElement key={id} id={id} roomId={roomId} />
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
  rooms: PropTypes.object.isRequired,
}
