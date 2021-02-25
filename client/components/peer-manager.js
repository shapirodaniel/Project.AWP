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
    // one isn't chosen, which is why the first arg
    // has been declared "undefined"
    this.self = new Peer(undefined, {
      host: 'localhost',
      port: 9000,
    })
  }

  /* socket.on('dispatch-user-left', (id) => {
      this.props.removeStreamFromRoom(this.props.room.roomId, id)
    }) */

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
      if (call.peer === this.self._id) {
        console.log('skipping duplicate!')
        return
      }
      call.on('stream', (stream) => {
        console.log(call)
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
        // store.dispatch(removePeer(call.peer))
      })
    })
  }

  componentDidMount() {
    this.handlePeerConnections()
  }

  componentDidUpdate() {
    const roomId = this.props.match.params.roomId
    socket.on('dispatch-user-left', (id) => {
      this.props.removeStreamFromRoom(roomId, id)
    })
  }

  componentWillUnmount() {
    const roomId = this.props.match.params.roomId
    for (let id in this.props.rooms[roomId].peers) {
      this.props.removeStreamFromRoom(roomId, id)
    }
    const id = this.self._id
    this.self.destroy()
    socket.emit('user-left', id)
  }

  render() {
    const participants = Object.entries(
      this.props.rooms[this.props.match.params.roomId].peers
    )

    let lastSeen = ''
    const uniqueParticipants = participants.filter((participant) => {
      const [participantId, MediaStream] = participant
      if (lastSeen !== MediaStream.id) {
        lastSeen = MediaStream.id
        return participant
      }
    })

    console.log('uniqueParticipants after filter: ', uniqueParticipants)

    return (
      <div id="video-display">
        {uniqueParticipants.map((participant) => {
          const [id] = participant
          return (
            <CustomVideoElement
              key={id}
              id={id}
              room={this.props.match.params.roomId}
            />
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
