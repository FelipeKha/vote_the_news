import React, { useState, useContext, useEffect, useCallback } from 'react';

import AccountCircle from '@mui/icons-material/AccountCircle';
import AdbIcon from '@mui/icons-material/Adb';
import AppBar from '@mui/material/AppBar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MuiAlert from '@mui/material/Alert';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import SignUpFormDialog from './SignUpFormDialog';
import SignInFormDialog from './SignInFormDialog';
import LogoutButton from './LogoutButton';
import { UserContext } from '../context/UserContext';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function NavAppBar(props) {
  const [userContext, setUserContext] = useContext(UserContext);
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [openInfoAlert, setOpenInfoAlert] = useState(false);
  const [infoMessage, setInfoMessage] = useState("")
  const [openSuccessAlert, setOpenSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState("")
  
  const refreshTokenUrl = process.env.REACT_APP_SERVER_URL + "refreshToken";
  const userDetailsUrl = process.env.REACT_APP_SERVER_URL + "me"

  const verifyUser = useCallback(() => {
    fetch(
      refreshTokenUrl,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      }
    )
      .then(async response => {
        if (response.ok) {
          const data = await response.json();
          setUserContext(oldValues => {
            return { ...oldValues, token: data.newToken };
          })
        } else {
          setUserContext(oldValues => {
            return { ...oldValues, token: null }
          })
        }
        setTimeout(verifyUser, 1000 * 60 * 5)
      })
  },
    [setUserContext]
  )

  const fetchUserDetails = useCallback(() => {
    fetch(
      userDetailsUrl,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userContext.token}`
        }
      }
    )
      .then(async response => {
        if (response.ok) {
          const data = await response.json();
          setUserContext(oldValues => {
            return { ...oldValues, details: data };
          })
        } else {
          if (response.status === 401) {
            // window.location.reload();
            console.log("no user details available.")
          } else {
            setUserContext(oldValues => {
              return { ...oldValues, details: null }
            })
          }
        }
      })
  },
    [setUserContext, userContext.token]
  )

  useEffect(() => {
    verifyUser();
  },
    [verifyUser]
  )

  useEffect(() => {
    if (!userContext.details) {
      fetchUserDetails();
    }
  },
    [fetchUserDetails, userContext.details]
  )

  const syncLogout = useCallback(e => {
    if (e.key === "logout") {
      window.location.reload();
    }
  },
    []
  )

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  function allArticlesHandler() {
    handleCloseNavMenu();
    props.allArticlesHandler();
  }

  function myArticlesHandler() {
    handleCloseNavMenu();
    props.myArticlesHandler();
  }

  function myVotesHandler() {
    handleCloseNavMenu();
    props.myVotesHandler();
  }

  function openInfoAlertHandler(message) {
    setInfoMessage(message);
    setOpenInfoAlert(true);
  }

  function openSuccessAlertHandler(message) {
    setSuccessMessage(message);
    setOpenSuccessAlert(true);
  }

  const handleCloseAlert = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenInfoAlert(false);
    setOpenSuccessAlert(false);
  };

  function MenuNavXs() {
    return (
      <>
        <MenuItem key="allArticles" onClick={allArticlesHandler}>
          <Typography textAlign="center">All Articles</Typography>
        </MenuItem>
        <MenuItem key="myArticles" onClick={myArticlesHandler}>
          <Typography textAlign="center">My Articles</Typography>
        </MenuItem>
        <MenuItem key="myVotes" onClick={myVotesHandler}>
          <Typography textAlign="center">My Votes</Typography>
        </MenuItem>
      </>
    )
  }

  function MenuNavMd() {
    return (
      <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
        <Button
          key="allArticles"
          onClick={allArticlesHandler}
          sx={{ my: 2, color: 'white', display: 'block' }}
        >
          All Articles
        </Button>
        <Button
          key="myArticles"
          onClick={myArticlesHandler}
          sx={{ my: 2, color: 'white', display: 'block' }}
        >
          My Articles
        </Button>
        <Button
          key="myVotes"
          onClick={myVotesHandler}
          sx={{ my: 2, color: 'white', display: 'block' }}
        >
          My Votes
        </Button>
      </Box>
    )
  }

  function VtnLogoMd() {
    return (
      <>
        <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
        <Typography
          variant="h6"
          noWrap
          component="a"
          href="/"
          sx={{
            mr: 2,
            display: { xs: 'none', md: 'flex' },
            fontFamily: 'monospace',
            fontWeight: 700,
            letterSpacing: '.3rem',
            color: 'inherit',
            textDecoration: 'none',
          }}
        >
          VOTE THE NEWS
        </Typography>
      </>
    )
  }

  function VtnLogoXs() {
    return (
      <>
        <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
        <Typography
          variant="h5"
          noWrap
          component="a"
          href=""
          sx={{
            mr: 2,
            display: { xs: 'flex', md: 'none' },
            flexGrow: 1,
            fontFamily: 'monospace',
            fontWeight: 700,
            letterSpacing: '.3rem',
            color: 'inherit',
            textDecoration: 'none',
          }}
        >
          VTN
        </Typography>
      </>
    )
  }

  function SignInUpButtons() {
    return (
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={1}
      >
        <SignUpFormDialog
          openSuccessAlertHandler={openSuccessAlertHandler}
        />
        <SignInFormDialog
          openSuccessAlertHandler={openSuccessAlertHandler}
        />
      </Stack>
    )
  }

  function MenuUser() {
    return (
      <>
        <MenuItem key="notifications" onClick={handleCloseUserMenu}>
          <IconButton
            size="large"
            aria-label="show 17 new notifications"
            color="inherit"
          >
            <Badge badgeContent={17} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Typography textAlign="center">Notifications</Typography>
        </MenuItem>
        <MenuItem key="profile" onClick={handleCloseUserMenu}>
          <IconButton
            size="large"
            aria-label="show 17 new notifications"
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
          <Typography textAlign="center">Profile</Typography>
        </MenuItem>
        <LogoutButton
          openInfoAlertHandler={openInfoAlertHandler}
        />
      </>
    )
  }

  function Snackbars() {
    return (
      <>
        <Snackbar open={openInfoAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
          <Alert onClose={handleCloseAlert} severity="info" sx={{ width: '100%' }}>
            {infoMessage}
          </Alert>
        </Snackbar>
        <Snackbar open={openSuccessAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
          <Alert onClose={handleCloseAlert} severity="success" sx={{ width: '100%' }}>
            {successMessage}
          </Alert>
        </Snackbar>
      </>
    )
  }

  return (
    <>
      <AppBar position="fixed">
        <Container maxWidth="xl">
          <Toolbar disableGutters>

            <VtnLogoMd />
            <MenuNavMd />

            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: 'block', md: 'none' },
                }}
              >
                <MenuNavXs />
              </Menu>
            </Box>

            <VtnLogoXs />

            {(userContext.token === null || !userContext.token) &&
              <SignInUpButtons />
            }

            {userContext.token &&
              <Box sx={{ flexGrow: 0 }}>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }} color="inherit">
                    <Badge badgeContent={17} color="error">
                      <AccountCircle fontSize='large' />
                    </Badge>
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuUser />
                </Menu>
              </Box>
            }

          </Toolbar>
        </Container>
      </AppBar>

      <Snackbars />
    </>
  );
}

export default NavAppBar;


