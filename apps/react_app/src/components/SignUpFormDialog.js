import React, { useContext, useState } from 'react';

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

function SignUpFormDialog(props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [open, setOpen] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [username, setUsername] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [userContext, setUserContext] = useContext(UserContext);

    function formSubmitHandler(e) {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        const genericErrorMessage = "Something went wrong, please try again.";

        // const signUpUrl = process.env.REACT_APP_SERVER_URL + "signup";

        let signUpUrl;
        if (process.env.REACT_APP_RUNNING_IN_DIGITAL_OCEAN === 'true') {
            signUpUrl = process.env.REACT_APP_SERVER_URL_DIGITAL_OCEAN + "signup";
        } else {
            signUpUrl = process.env.REACT_APP_SERVER_URL_LOCAL + "signup";
        }

        fetch(
            signUpUrl,
            {
                method: 'POST',
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    firstName: firstName,
                    lastName: lastName,
                    nameDisplayed: username,
                    username: email,
                    password: password
                })
            }
        )
            .then(async response => {
                setIsSubmitting(false);
                if (!response.ok) {
                    if (response.status === 400) {
                        setError("Please fill in all fields correctly.");
                    } else if (response.status === 401) {
                        setError("Invalid email and password combination.");
                    } else if (response.status === 500) {
                        const data = await response.json();
                        if (data.message) {
                            setError(data.message);
                        } else {
                            setError(genericErrorMessage);
                        }
                    } else {
                        setError(genericErrorMessage);
                    }
                } else {
                    const data = await response.json();
                    setUserContext(oldValues => {
                        return { ...oldValues, token: data.token };
                    })
                    props.openSuccessAlertHandler(`Welcome ${data.username}!`);
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
                label="Sign Up"
                variant="outlined"
                sx={{
                    borderColor: "white",
                    color: "white"
                }}
                onClick={() => setOpen(true)}
            />
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
                <form onSubmit={formSubmitHandler}>
                    <DialogTitle>Sign Up</DialogTitle>
                    <DialogContent>
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
                            <div>
                                <TextField
                                    id="password"
                                    type="password"
                                    label="Password"
                                    variant="outlined"
                                    margin="dense"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    fullWidth
                                />
                            </div>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpen(false)}>Cancel</Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Signing Up..." : "Sign Up"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </div>
    );
}

export default SignUpFormDialog;