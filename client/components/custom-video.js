import React from 'react'
import {connect} from 'react-redux'

class CustomVideoElement extends React.Component {
  constructor(props) {
    super(props)
    this.videoRef = React.createRef()
  }

  render() {
    return <video ref={this.videoRef} autoPlay={true} />
  }

  componentDidMount() {
    this.stream = () => this.props.rooms[this.props.room].peers[this.props.id]
    this.updateVideoStream()
  }

  componentDidUpdate() {
    this.updateVideoStream()
  }

  updateVideoStream() {
    if (this.videoRef.current.srcObject !== this.stream()) {
      this.videoRef.current.srcObject = this.stream()
    }
  }
}

const mapState = (state) => ({
  rooms: state.rooms,
})

export default connect(mapState)(CustomVideoElement)
