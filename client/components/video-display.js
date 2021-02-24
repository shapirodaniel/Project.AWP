import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'

/**
 * COMPONENT
 */
export const VideoDisplay = (props) => {
  const {users} = props
  return (
    <div>
      {users.map((user) => (
        <video
          key={user.id}
          id={user.id}
          muted="true"
          srcObject={user.stream}
          onLoadedMetadata={() => {
            document.getElementById(user.id).play()
          }}
        />
      ))}
    </div>
  )
}

/**
 * CONTAINER
 */
const mapState = (state) => ({
  users: state.users,
})

const mapDispatch = (dispatch) => ({})

export default connect(mapState, mapDispatch)(VideoDisplay)

/**
 * PROP TYPES
 */
VideoDisplay.propTypes = {
  room: PropTypes.string.isRequired,
}
