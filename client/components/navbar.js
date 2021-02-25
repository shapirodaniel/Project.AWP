import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'
import {logout} from '../store'

const Navbar = ({handleClick, isLoggedIn}) => (
  <div>
    <div className="topline-banner">
      <img src="https://i.imgur.com/E5nkxzt.png" />
      <div>
        <div className="titleCopy">
          <h1>REDFISH / BLUEFISH</h1>
          <span>a webRTC Zoom clone</span>
        </div>
        <nav>
          {isLoggedIn ? (
            <div>
              {/* The navbar will show these links after you log in */}
              <Link to="/home">Home</Link>
              <a href="#" onClick={handleClick}>
                Logout
              </a>
            </div>
          ) : (
            <div>
              {/* The navbar will show these links before you log in */}
              <Link to="/login">Login</Link>
              <Link to="/signup">Sign Up</Link>
            </div>
          )}
        </nav>
      </div>
    </div>
  </div>
)

/**
 * CONTAINER
 */
const mapState = (state) => {
  return {
    isLoggedIn: !!state.user.id,
  }
}

const mapDispatch = (dispatch) => {
  return {
    handleClick() {
      dispatch(logout())
    },
  }
}

export default connect(mapState, mapDispatch)(Navbar)

/**
 * PROP TYPES
 */
Navbar.propTypes = {
  handleClick: PropTypes.func.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
}
