import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';

class SignUpForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            username: '',
            email: '',
            password: ''
        };

        this.handleClickOpen = this.handleClickOpen.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleChangeUsernameField = this.handleChangeUsernameField.bind(this);
        this.handleChangeEmailField = this.handleChangeEmailField.bind(this);
        this.handleChangePasswordField = this.handleChangePasswordField.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleClickOpen = () => {
        this.setState({ open: true });
    };

    handleClose() {
        this.setState({ open: false });
    };

    handleChangeUsernameField(event) {
        this.setState({ username: event.target.value });
    }

    handleChangeEmailField(event) {
        this.setState({ email: event.target.value });
    }

    handleChangePasswordField(event) {
        this.setState({ password: event.target.value });
    }

    handleSubmit(event) {
        event.preventDefault();
        this.handleClose();
        this.signUpNewUser();
    }

    signUpNewUser() {
        const bodyObject = {
            username: this.state.username,
            email: this.state.email,
            password: this.state.password
        }

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bodyObject)
        }

        fetch('http://localhost:4000/')
    }

    render() {
        return (
            <div>
                <Button color="inherit" onClick={this.handleClickOpen}>
                    Sign Up
                </Button>
                <Dialog open={this.state.open} onClose={this.handleClose} fullWidth>
                    <form onSubmit={this.handleSubmit}>
                        <DialogTitle>Sign UP</DialogTitle>
                        <DialogContent>
                            <Box>
                                <div>
                                    <TextField id="username" type="text" label="Username" variant="outlined" margin="dense" onChange={this.handleChangeUsernameField} fullWidth />
                                </div>
                                <div>
                                    <TextField id="email" type="email" label="Email" variant="outlined" margin="dense" onChange={this.handleChangeEmailField} fullWidth />
                                </div>
                                <div>
                                    <TextField id="password" type="password" label="Password" variant="outlined" margin="dense" onChange={this.handleChangePasswordField} fullWidth />
                                </div>
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={this.handleClose}>Cancel</Button>
                            <Button type="submit" >Sign Up</Button>
                        </DialogActions>
                    </form>
                </Dialog>
            </div>
        );
    }
}

export default SignUpForm;