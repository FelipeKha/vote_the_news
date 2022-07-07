import React from "react"

import Header from "./Header"
import StreamContainer from "./StreamContainer"
import ButtonAppBar from "./ButtonAppBar";
import "../styles/GridContainer.css"

class GridContainer extends React.Component {
  render() {
    return (
      <div className='gridContainer'>
        <ButtonAppBar />
        <StreamContainer />
      </div>
    )
  }
}

export default GridContainer