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

    // first, attach listener to open event
    // so that we have access to this.self.id
    // and add self to room
    this.self.on('open', async (myId) => {
      // get my stream and add to room
      const myStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      socket.emit('add-peer', myId)

      await this.props.addStreamToRoom(roomId, myId, myStream)

      socket.on('dispatch-add-peer', (newUserId) => {
        console.log(
          'this is add-peer data bounced back from server: ',
          newUserId
        )

        const call = this.self.call(newUserId, myStream)
      })
    })

    this.self.on('call', (call) => {
      console.log('this is call received from another user, ', call)
    })

    // then, connect to everyone else in the room
    this.connectToPeers()
  }

  componentDidUpdate(prevProps) {
    const prevPeers = Object.entries(
      prevProps.rooms[this.props.match.params.roomId].peers
    )

    const peers = Object.entries(
      this.props.rooms[this.props.match.params.roomId].peers
    )

    if (prevPeers.length !== peers.length) this.connectToPeers()
  }

  componentWillUnmount() {
    const roomId = this.props.match.params.roomId
    const userId = this.self._id
    this.props.removeStreamFromRoom(roomId, userId)
  }

  connectToPeers() {
    const roomId = this.props.match.params.roomId

    /* this.props.room.peers is an object
     * we unpack it with Object.entries()
     * each peer is a key-val pair that's been
     * converted to a subarray: [ id, stream ]
     */

    const participants = Object.entries(
      this.props.rooms[this.props.match.params.roomId].peers
    ).filter((peer) => peer[0] !== this.self.id)

    const myRoom = this.props.rooms[this.props.match.params.roomId]

    // after componentDidMount, our id/stream is available
    const myStream = myRoom[this.self.id]

    // answer any calls to self with myStream
    this.self.on('call', (call) => {
      call.answer(myStream)
    })

    // Assign a call to each participant in the room
    // this will allow us to add and remove peers
    // when they call us. If someone gets dropped,
    // the store will be updated and the component
    // will re-render without that peer
    /* participants.forEach((peer) => {
      const call = this.self.call(peer.userId, peer.stream)

      call.on('stream', () => {
        this.props.addStreamToRoom(roomId, peer.userId, peer.stream)
      })

      call.on('close', () => {
        this.props.removeStreamFromRoom(roomId, peer.userId)
      })
    }) */
  }

  render() {
    // unfiltered, as we'd like to show our video
    // as well as our peers' videos!
    const participants = Object.entries(
      this.props.rooms[this.props.match.params.roomId].peers
    )

    return (
      <div id="video-display">
        {participants.map((participant) => {
          const [id] = participant
          return (
            /* <video
              key={id}
              id={id}
              muted={true}
              src={stream}
              onLoadedMetadata={(e) => {
                e.target.play()
              }}
            /> */
            <CustomVideoElement key={id} id={id} />
          )
        })}
      </div>
    )
  }
}

/**
 * CONTAINER
 */
const mapState = (state) => ({
  // get room identifier from routeProps /:room wildcard
  // use it to select the room we're in from this.props.rooms
  rooms: state.rooms,
})

const mapDispatch = (dispatch) => ({
  // these thunks add userId: stream key-val pairs
  // to whichever room we're in
  // by
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
