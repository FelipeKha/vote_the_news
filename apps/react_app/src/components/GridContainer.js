import React from "react"
import Header from "./Header"
import StreamContainer from "./StreamContainer"
import "../styles/GridContainer.css"

class GridContainer extends React.Component {
    render() {
      return (
        <div className='gridContainer'>
          <Header />
          <StreamContainer />
        </div>
      )
    }
  }

  export default GridContainer