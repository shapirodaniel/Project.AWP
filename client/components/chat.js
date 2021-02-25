import React from 'react'
import {connect} from 'react-redux'
import {fetchAddMessageToChat} from '../store/rooms'
import socket from '../socket'

let msgId = 0

class Chat extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      message: '',
    }
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  componentDidMount() {
    const roomId = this.props.roomId
    this.props.updateMessages({
      roomId,
      email: this.props.user.email,
      msgId,
      message: `Welcome to the ${roomId} team ${this.props.user.email}!`,
    })
    socket.on('dispatch-chat-message', (chatPayload) => {
      if (this.props.roomId === chatPayload.roomId) {
        this.props.updateMessages(chatPayload)
      }
    })
  }

  handleChange(evt) {
    this.setState({
      [evt.target.name]: evt.target.value,
    })
  }

  async handleSubmit(evt) {
    evt.preventDefault()
    const chatPayload = {
      roomId: this.props.roomId,
      email: this.props.user.email,
      [++msgId]: this.state.message,
    }
    socket.emit('chat-message', chatPayload)
    console.log('socket emitted message! ', chatPayload)
    await this.updateMessages()
  }

  render() {
    const {user, rooms} = this.props
    const {handleChange, handleSubmit} = this
    return (
      <div>
        <div id="messages">
          {Object.values(rooms.chat).forEach((msg) => (
            <div>{`${msg.email}: ${msg.message}`}</div>
          ))}
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="message"
            value={this.state.message || ''}
            onChange={handleChange}
          />
          <button type="submit">Send Message</button>
        </form>
      </div>
    )
  }
}

const mapState = (state) => ({
  rooms: state.rooms,
  currentRoom: state.currentRoom,
  user: state.user,
})

const mapDispatch = (dispatch) => ({
  // chatPayload is an object containing roomId, msgId, message

  updateMessages: (chatPayload) => dispatch(fetchAddMessageToChat(chatPayload)),
})

export default connect(mapState, mapDispatch)(Chat)
