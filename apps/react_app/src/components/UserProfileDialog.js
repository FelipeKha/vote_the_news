import React, { useState, useContext } from 'react';

import AccountCircle from '@mui/icons-material/AccountCircle';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import PropTypes from 'prop-types';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';

import { UserContext } from '../context/UserContext';

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography
                        component={'span'}
                        variant={'body2'}
                    >
                        {children}
                    </Typography>
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

function UserProfileDialog(props) {
    const [openDialog, setOpenDialog] = useState(false);
    const [value, setValue] = React.useState(0);

    const [isSubmittingInfo, setIsSubmittingInfo] = useState(false);
    const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
    const [errorInfo, setErrorInfo] = useState("");
    const [errorPassword, setErrorPassword] = useState("");
    const [open, setOpen] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [username, setUsername] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
    const [userContext, setUserContext] = useContext(UserContext);

    const handleClickOpen = () => {
        setOpenDialog(true);
        setFirstName(userContext.details.firstName);
        setLastName(userContext.details.lastName);
        setUsername(userContext.details.nameDisplayed);
        setEmail(userContext.details.username);
        // props.handleCloseUserMenu();
    };

    const handleClose = () => {
        setOpenDialog(false);
    };

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleUpdateUserInfo = (e) => {
        e.preventDefault();
        setIsSubmittingInfo(true);
        setErrorInfo("");

        const genericErrorMessage = "Something went wrong, please try again."

        const updateUrl = process.env.REACT_APP_SERVER_URL + "updateuserinfo";

        fetch(
            updateUrl,
            {
                method: 'POST',
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userContext.token}`
                },
                body: JSON.stringify({
                    firstName: firstName,
                    lastName: lastName,
                    nameDisplayed: username,
                    username: email
                })
            }
        )
            .then(async response => {
                setIsSubmittingInfo(false);
                if (!response.ok) {
                    console.log(response);
                    if (response.status === 400) {
                        setErrorInfo("Please fill in all fields correcly.");
                    } else if (response.status === 401) {
                        setErrorInfo("Invalid email and password combination.");
                    } else if (response.status === 500) {
                        const data = await response.json();
                        setErrorInfo(`${data.name} : ${data.message}`);
                    } else {
                        setErrorInfo(genericErrorMessage);
                    }
                } else {
                    props.openSuccessAlertHandler(`Updates successfully saved!`);
                }
            })
            .catch(err => {
                setIsSubmittingInfo(false);
                setErrorInfo(genericErrorMessage);
            })
    }

    const handleChangePassword = (e) => {
        e.preventDefault();
        setIsSubmittingPassword(true);
        setErrorPassword("");

        const genericErrorMessage = "Something went wrong, please try again."

        const changePasswordUrl = process.env.REACT_APP_SERVER_URL + "changepassword";

        fetch(
            changePasswordUrl,
            {
                method: 'POST',
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userContext.token}`
                },
                body: JSON.stringify({
                    oldPassword: oldPassword,
                    newPassword: newPassword,
                    newPasswordConfirm: newPasswordConfirm
                })
            }
        )
            .then(async response => {
                setIsSubmittingPassword(false);
                if (!response.ok) {
                    console.log(response);
                    if (response.status === 400) {
                        setErrorPassword("Please fill in all fields correcly.");
                    } else if (response.status === 401) {
                        setErrorPassword("Invalid email and password combination.");
                    } else if (response.status === 500) {
                        console.log('Error 500');
                        const data = await response.json();
                        console.log(data);
                        setErrorPassword(`${data.name} : ${data.message}`);
                    } else {
                        setErrorPassword(genericErrorMessage);
                    }
                } else {
                    props.openSuccessAlertHandler(`Password successfully changed!`);
                }
            })
            .catch(err => {
                setIsSubmittingPassword(false);
                setErrorPassword(genericErrorMessage);
            })
    }


    return (
        <div>
            <MenuItem key="profile" onClick={handleClickOpen}>
                <IconButton
                    size="large"
                    aria-label="show 17 new notifications"
                    color="inherit"
                >
                    <AccountCircle />
                </IconButton>
                <Typography textAlign="center">
                    Profile
                </Typography>
            </MenuItem>
            <Dialog open={openDialog} onClose={handleClose}>
                <DialogTitle>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                            <Tab label="Update Profile" {...a11yProps(0)} />
                            <Tab label="Change Password" {...a11yProps(1)} />
                        </Tabs>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <TabPanel value={value} index={0}>
                        <form onSubmit={handleUpdateUserInfo}>
                            <Box>
                                {errorInfo && <Alert severity="error">{errorInfo}</Alert>}
                                <div>
                                    <TextField
                                        id="firstName"
                                        type="text"
                                        label="First Name"
                                        variant="outlined"
                                        margin="dense"
                                        value={firstName}
                                        onChange={e => setFirstName(e.target.value)}
                                        fullWidth
                                    />
                                </div>
                                <div>
                                    <TextField
                                        id="lastName"
                                        type="text"
                                        label="Last Name"
                                        variant="outlined"
                                        margin="dense"
                                        value={lastName}
                                        onChange={e => setLastName(e.target.value)}
                                        fullWidth
                                    />
                                </div>
                                <div>
                                    <TextField
                                        id="username"
                                        type="text"
                                        label="Username"
                                        variant="outlined"
                                        margin="dense"
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        fullWidth
                                    />
                                </div>
                                <div>
                                    <TextField
                                        id="email"
                                        type="email"
                                        label="Email"
                                        variant="outlined"
                                        margin="dense"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        fullWidth
                                    />
                                </div>
                            </Box>
                            <DialogActions>
                                <Button onClick={handleClose}>Cancel</Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmittingInfo}
                                >
                                    {isSubmittingInfo ? "Saving Changes..." : "Save Changes"}
                                </Button>
                            </DialogActions>
                        </form>
                    </TabPanel>
                    <TabPanel value={value} index={1}>
                        <form onSubmit={handleChangePassword}>
                            <Box>
                                {errorPassword && <Alert severity="error">{errorPassword}</Alert>}
                                <div>
                                    <TextField
                                        id="oldPassword"
                                        type="password"
                                        label="Old Password"
                                        variant="outlined"
                                        margin="dense"
                                        value={oldPassword}
                                        onChange={e => setOldPassword(e.target.value)}
                                        fullWidth
                                    />
                                </div>
                                <div>
                                    <TextField
                                        id="newPassword"
                                        type="password"
                                        label="New Password"
                                        variant="outlined"
                                        margin="dense"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        fullWidth
                                    />
                                </div>
                                <div>
                                    <TextField
                                        id="newPasswordConfirm"
                                        type="password"
                                        label="Confirm New Password"
                                        variant="outlined"
                                        margin="dense"
                                        value={newPasswordConfirm}
                                        onChange={e => setNewPasswordConfirm(e.target.value)}
                                        fullWidth
                                    />
                                </div>
                            </Box>
                            <DialogActions>
                                <Button onClick={handleClose}>Cancel</Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmittingPassword}
                                >
                                    {isSubmittingPassword ? "Changing Password..." : "Change Password"}
                                </Button>
                            </DialogActions>
                        </form>
                    </TabPanel>
                </DialogContent>
            </Dialog>
        </div >
    );
}

export default UserProfileDialog;

