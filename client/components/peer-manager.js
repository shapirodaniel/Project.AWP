import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import VideoDisplay from './components'
import socket from '../socket'

/**
 * COMPONENT
 */
export class PeerManager extends React.Component {
  constructor(props) {
    super(props)

    // peer.min.js served from public/index.html
    // Peers should be established by/in thunk
    // undef so Peer constructor assigns a random ID
    this.self = new Peer(undefined, {
      host: this.props.room.name,
      port: this.props.room.port,
    })

    this.state = {
      peers: {},
    }
  }

  /* all of this state has to be managed by redux,
     else videodisplay can't be a separate element,
     since prop drilling will get ugly ... */

  // add peer to this.self
  addPeer(userId, stream) {
    this.setState({
      ...this.state,
      peers: {
        ...this.state.peers,
        [userId]: {
          userId,
          stream,
        },
      },
    })
  }

  // remove peer from this.self
  removePeer(userId) {
    this.setState({
      ...this.state,
      peers: {
        ...this.state.peers.filter((peer) => peer.userId !== userId),
      },
    })
  }

  async connectToPeers() {
    // participants are whichever users have been associated
    // with a particular room, handled by sockets
    const {participants} = this.props.room

    // get my stream
    const myStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    })

    this.self.on('open', (id) => {
      // add self to room's list of participants
      // need a thunk to do this:
      socket.emit('join-room', ROOM_ID, id)
    })

    // assign listener for calls to this.self
    // answer calls to this.self with myStream
    this.self.on('call', (call) => {
      call.answer(myStream)
    })

    // set local state for each participant
    // as userId: stream
    participants.forEach((participant) =>
      this.addPeer(participant.id, participant.stream)
    )

    // call each peer in room
    this.state.peers.forEach((peer) => {
      const call = this.self.call(peer.userId, peer.stream)

      call.on('stream', (stream) => {
        this.addPeer(peer.userId, stream)
      })

      call.on('close', () => {
        this.removePeer(peer.userId)
      })
    })
  }

  componentDidMount() {
    this.connectToPeers()
  }

  render() {
    const participants = [...this.state.peers]
    this.connectToPeers()
    return (
      /* video display ele */
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
const mapState = (state) => ({
  // room will need to keep track of its users
  room: state.room,
})

const mapDispatch = (dispatch) => ({
  addStreamToRoom: () => dispatch(/* add stream to room thunk */),
  removeStreamFromRoom: () => dispatch(/* remove stream from room thunk */),
})

export default connect(mapState, mapDispatch)(PeerManager)

/**
 * PROP TYPES
 */
PeerManager.propTypes = {
  // room needs to have at least name, port associated with it
  // because there will need to be a different Peer instance
  // listening to each room
  room: PropTypes.string.isRequired,
}
