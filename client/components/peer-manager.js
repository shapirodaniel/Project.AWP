import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {fetchAddPeer, fetchRemovePeer} from '../store/rooms'

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
    const roomId = this.props.room.id

    // first, attach listener to open event
    // so that we have access to this.self.id
    // and add self to room
    this.self.on('open', async (myId) => {
      // get my stream and add to room
      const myStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      await this.props.addStreamToRoom(roomId, myId, myStream)
    })

    // then, connect to everyone else in the room
    this.connectToPeers()
  }

  connectToPeers() {
    const roomId = this.props.room.id

    const participants = [...this.props.room.peers].filter(
      (peer) => peer.id !== this.self.id
    )

    // after componentDidMount, our id/stream is available
    const myStream = this.props.room.peers[this.self.id].stream

    // answer any calls to self with myStream
    this.self.on('call', (call) => {
      call.answer(myStream)
    })

    // Assign a call to each participant in the room
    // this will allow us to add and remove peers
    // when they call us. If someone gets dropped,
    // the store will be updated and the component
    // will re-render without that peer
    participants.forEach((peer) => {
      const call = this.self.call(peer.userId, peer.stream)

      call.on('stream', () => {
        this.props.addStreamToRoom(roomId, peer.userId, peer.stream)
      })

      call.on('close', () => {
        this.props.removeStreamFromRoom(roomId, peer.userId)
      })
    })
  }

  render() {
    // unfiltered, as we'd like to show our video
    // as well as our peers' videos!
    const participants = [...this.props.room.peers]

    return (
      <div className="video-container">
        {participants.map((participant) => (
          <video
            key={participant.id}
            id={participant.id}
            muted="true"
            srcObject={participant.stream}
            onLoadedMetadata={(e) => {
              e.target.play()
            }}
          />
        ))}
      </div>
    )
  }
}

/**
 * CONTAINER
 */
const mapState = (state) => {
  // get room identifier from routeProps /:room wildcard
  // use it to select the room we're in
  // room: state.rooms[this.props.match.params.room],
  return {room: state.rooms[state.currentRoom]}
}

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
  room: PropTypes.object.isRequired,
}
