import React, { useContext, useState } from 'react';

import IconButton from '@mui/material/IconButton';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

import { UserContext } from '../context/UserContext';



function LogoutButton(props) {
    const [userContext, setUserContext] = useContext(UserContext);

    // const logoutUrl = process.env.REACT_APP_SERVER_URL + "logout";

    let logoutUrl;
    if (process.env.REACT_APP_RUNNING_IN_DIGITAL_OCEAN === 'true') {
        logoutUrl = process.env.REACT_APP_SERVER_URL_DIGITAL_OCEAN + "logout";
    } else {
        logoutUrl = process.env.REACT_APP_SERVER_URL_LOCAL + "logout";
    }

    function logoutHandler() {
        fetch(
            logoutUrl,
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
                const username = userContext.details.nameDisplayed;
                setUserContext(oldValues => {
                    return { ...oldValues, details: undefined, token: null };
                })
                window.localStorage.setItem("logout", Date.now());
                props.openInfoAlertHandler(`See you soon ${username}!`);
            })
    }


    return (
        <div>
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
        </div>

    )
}

export default LogoutButton;