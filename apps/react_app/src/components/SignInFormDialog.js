import React, { useState, useContext } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';

import { UserContext } from '../context/UserContext';

function SignInFormDialog(props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("")
    const [openDialog, setOpenDialog] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [userContext, setUserContext] = useContext(UserContext);

    function formSubmitHandler(e) {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        const genericErrorMessage = "Something went wrong, please try again."

        const loginUrl = process.env.REACT_APP_SERVER_URL + "login";

        fetch(
            loginUrl,
            {
                method: 'POST',
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: email,
                    password: password
                })
            }
        )
            .then(async response => {
                setIsSubmitting(false);
                if (!response.ok) {
                    if (response.status === 400) {
                        setError("Please fill in all fields correcly.");
                    } else if (response.status === 401) {
                        setError("Invalid email and password combination.");
                    } else {
                        setError(genericErrorMessage);
                    }
                } else {
                    const data = await response.json();
                    setUserContext(oldValues => {
                        return { ...oldValues, token: data.token };
                    })
                    props.openSuccessAlertHandler(`Welcome back ${data.username}!`);
                }
            })
            .catch(err => {
                setIsSubmitting(false);
                setError(genericErrorMessage);
            })
    }

    return (
        <div>
            <Chip
                label="Sign In"
                variant="outlined"
                sx={{
                    borderColor: "white",
                    color: "white"
                }}
                onClick={() => setOpenDialog(true)}
            />
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                fullWidth>
                <form onSubmit={formSubmitHandler}>
                    <DialogTitle>Sign In</DialogTitle>
                    <DialogContent>
                        <Box>
                            {error && <Alert severity="error">{error}</Alert>}
                            <div>
                                <TextField
                                    id="username"
                                    type="text"
                                    label="Email"
                                    variant="outlined"
                                    margin="dense"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    fullWidth />
                            </div>
                            <div>
                                <TextField
                                    id="password"
                                    type="password"
                                    label="Password"
                                    variant="outlined"
                                    margin="dense"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    fullWidth />
                            </div>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Signing In..." : "Sign In"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </div>
    );
}

export default SignInFormDialog;