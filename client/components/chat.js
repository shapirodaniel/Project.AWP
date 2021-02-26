import React from 'react'
import {connect} from 'react-redux'
import {fetchAddMessageToChat} from '../store/rooms'
import socket from '../socket'
import {v4 as uuidv4} from 'uuid'
import PropTypes from 'prop-types'

// helper generates unique ids for chat messages
const getMsgId = () => uuidv4()

/**
 * COMPONENT
 */
class Chat extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      message: '',
    }
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  async componentDidMount() {
    const roomId = this.props.roomId

    /**
     * Send a welcome message on user connection.
     */

    await this.props.updateMessages({
      roomId: roomId,
      email: 'chat@bot.chat',
      msgId: getMsgId(),
      message: `Welcome to the ${roomId} team ${this.props.user.email}!`,
    })

    /**
     * Only update chat if message originated in our room.
     */

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
      msgId: getMsgId(),
      message: this.state.message,
    }

    /**
     * Send that message out to the world!
     */

    socket.emit('chat-message', chatPayload)

    await this.props.updateMessages(chatPayload)
  }

  render() {
    const roomId = this.props.roomId
    const {rooms} = this.props || {}
    const messages = Object.entries(rooms[roomId].chat)
    const {handleChange, handleSubmit} = this
    return (
      <div>
        <div id="messages">
          {messages.map(([id, content]) => (
            <div className="chatEntry" key={id}>
              <div className="chatName">{content.email} ></div>
              <div className="chatMessage">{content.message}</div>
            </div>
          ))}
        </div>
        <div id="chatInputAndButton">
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
      </div>
    )
  }
}

/**
 * CONTAINER
 */
const mapState = (state) => ({
  rooms: state.rooms,
  user: state.user,
})

const mapDispatch = (dispatch) => ({
  updateMessages: (chatPayload) => dispatch(fetchAddMessageToChat(chatPayload)),
})

export default connect(mapState, mapDispatch)(Chat)

/**
 * PROP TYPES
 */
Chat.propTypes = {
  rooms: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  updateMessages: PropTypes.func.isRequired,
}
