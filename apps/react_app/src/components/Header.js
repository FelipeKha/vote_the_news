import React from "react";
import "../styles/Header.css"

class Header extends React.Component {
    render() {
      return (
        <header className='siteHeader'>
          <nav className='siteHeaderNav'>
            <h1>
              <a className='siteHeaderLogo'>Vote The News</a>
            </h1>
            <ul className='siteHeaderNavList'>
              <li className='siteHeaderNavListItem'>All Articles</li>
              <li className='siteHeaderNavListItem'>My Articles</li>
              <li className='siteHeaderNavListItem'>My Votes</li>
            </ul>
            <a className='logOutButton'>Log Out</a>
          </nav>
        </header>
      )
    }
  
  }

  export default Header