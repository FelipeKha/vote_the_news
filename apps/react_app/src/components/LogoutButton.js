import React, { useContext } from 'react';

import IconButton from '@mui/material/IconButton';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

import { UserContext } from '../context/UserContext';

function LogoutButton(props) {
    const [userContext, setUserContext] = useContext(UserContext);

    function logoutHandler() {
        fetch(
            'http://localhost:4000/logout',
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
                setUserContext(oldValues => {
                    return { ...oldValues, details: undefined, token: null };
                })
                window.localStorage.setItem("logout", Date.now());
            })
    }

    return (
        <MenuItem key="center" onClick={logoutHandler}>
            <IconButton
                size="large"
                aria-label="show 17 new notifications"
                color="inherit"
            >
                <LogoutIcon />
            </IconButton>
            <Typography textAlign="center">Logout</Typography>
        </MenuItem>
    )
}

export default LogoutButton;