import * as React from 'react';
import Button from '@mui/material/Button';




class LogoutButton extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
    }

    handleLogout() {
        this.props.onLogout();
    }

    handleClick() {
        fetch("http://localhost:4000/logout")
            .then(res => res.json())
            .then(
                (result) => {
                    if (result.message === 'successfully logged out') {
                        this.handleLogout();
                    }
                }
            )
    }
    render() {
        return (
            <Button color="inherit" onClick={this.handleClick}>Logout</Button>
        )
    }
}

export default LogoutButton