import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'

/**
 * COMPONENT
 */
export const UserHome = (props) => {
  const {name} = props

  return (
    <div>
      <h3>Welcome, {name}!</h3>
      <div>Select a room:</div>
      <div id="room-container">
        <Link to="/rooms/red">
          <div>
            <span>Red</span>
          </div>
        </Link>
        <Link to="/rooms/blue">
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
  name: state.user.displayName,
})

export default connect(mapState)(UserHome)

/**
 * PROP TYPES
 */
UserHome.propTypes = {
  name: PropTypes.string.isRequired,
}
