import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'

/**
 * COMPONENT
 */
export const UserHome = (props) => {
  const {name, rooms} = props

  return (
    <div>
      <h3>Welcome, {name}!</h3>
      <div>Select a room or start a new one:</div>
      <div id="room-container">
        {rooms.map((room) => (
          <div key={room.id}>
            <Link to={`/room/${room.id}`}>
              <span className="room">{room.name}</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * CONTAINER
 */
const mapState = (state) => {
  return {
    name: state.user.displayName,
    rooms: state.rooms,
  }
}

export default connect(mapState)(UserHome)

/**
 * PROP TYPES
 */
UserHome.propTypes = {
  name: PropTypes.string.isRequired,
  rooms: PropTypes.array.isRequired,
}
