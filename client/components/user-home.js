import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'
import {fetchSetCurrentRoom} from '../store/currentRoom'

/**
 * COMPONENT
 */
export const UserHome = ({email, setCurrentRoom}) => {
  return (
    <div>
      <h3>Welcome, {email}!</h3>
      <div>Select a room:</div>
      <div id="room-container">
        <Link to="/rooms/red" onClick={setCurrentRoom('red')}>
          <div>
            <span>Red</span>
          </div>
        </Link>
        <Link to="/rooms/blue" room="blue">
          <div>
            <span>Blue</span>
          </div>
        </Link>
      </div>
    </div>
  )
}

/**
 * CONTAINER
 */
const mapState = (state) => ({
  email: state.user.email,
})

const mapDispatch = (dispatch) => ({
  setCurrentRoom: (roomId) => dispatch(fetchSetCurrentRoom(roomId)),
})

export default connect(mapState, mapDispatch)(UserHome)

/**
 * PROP TYPES
 */
UserHome.propTypes = {
  email: PropTypes.string.isRequired,
  setCurrentRoom: PropTypes.func.isRequired,
}
