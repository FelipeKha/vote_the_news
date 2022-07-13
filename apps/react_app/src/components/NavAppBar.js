import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

import SignUpFormDialog from './SignUpFormDialog';
import SignInFormDialog from './SignInFormDialog';
import LogoutButton from './LogoutButton';

class NavAppBar extends React.Component {
  constructor(props) {
    super(props);

    this.handleLogin = this.handleLogin.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
  }

  handleLogin(user) {
    this.props.onLogin(user);
  }

  handleLogout() {
    this.props.onLogout();
  }

  render() {
    const isLoggedIn = this.props.isLoggedIn;
    return (
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              News
            </Typography>
            {isLoggedIn
              ? <LogoutButton onLogout={this.handleLogout} />
              : <>
                <SignUpFormDialog onLogin={this.handleLogin} />
                <SignInFormDialog onLogin={this.handleLogin} />
              </>
            }
          </Toolbar>
        </AppBar>
      </Box>
    );
  }
}

export default NavAppBar;
