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
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';

import { UserContext } from '../context/UserContext';

function UserProfileDialog(props) {
    const [openDialog, setOpenDialog] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [open, setOpen] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [username, setUsername] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
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
                <DialogTitle>User Profile</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        You can edit your profile here.
                    </DialogContentText>
                    <Box>
                        {error && <Alert severity="error">{error}</Alert>}
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
                        <DialogContentText>
                            Enter current password to update.
                        </DialogContentText>
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
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleClose}>Save Changes</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default UserProfileDialog;