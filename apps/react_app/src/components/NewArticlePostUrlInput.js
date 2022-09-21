import React, { useContext, useState } from 'react';

import Button from '@mui/material/Button';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import LinkIcon from '@mui/icons-material/Link';
import MuiAlert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import SendIcon from '@mui/icons-material/Send';
import Snackbar from '@mui/material/Snackbar';

import ArticleCard from './ArticleCard';
import ArticleCardSkeleton from './ArticleCardSkeleton';
import { UserContext } from '../context/UserContext';

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function NewArticlePostUrlInput() {
    const [userContext, setUserContext] = useContext(UserContext);
    const [articleUrl, setArticleUrl] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [articlePosted, setArticlePosted] = useState({});
    const [openErrorAlert, setOpenErrorAlert] = useState(false);
    const [openSuccessAlert, setOpenSuccessAlert] = useState(false);

    function formSubmitHandler(e) {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        const genericErrorMessage = "Something went wrong, please try again."

        // const newArticlePostUrl = process.env.REACT_APP_SERVER_URL + "newarticlepost";

        let newArticlePostUrl;
        if (process.env.REACT_APP_RUNNING_IN_DIGITAL_OCEAN === 'true') {
            newArticlePostUrl = process.env.REACT_APP_SERVER_URL_DIGITAL_OCEAN + "newarticlepost";
        } else {
            newArticlePostUrl = process.env.REACT_APP_SERVER_URL_LOCAL + "newarticlepost";
        }

        fetch(
            newArticlePostUrl,
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${userContext.token}`
                },
                body: JSON.stringify({ url: articleUrl })
            }
        )
            .then(async response => {
                setIsSubmitting(false);
                const data = await response.json();
                if (response.ok) {
                    setArticlePosted(data);
                    setOpenSuccessAlert(true);
                } else {
                    if (response.status === 401) {
                        console.log(`Setting error to: ${data.message}`);
                        setError(data.message)
                        setOpenErrorAlert(true);
                    } else {
                        setError(genericErrorMessage)
                        setOpenErrorAlert(true);
                    }
                }
            })
            .catch(err => {
                setIsSubmitting(false);
                setError(genericErrorMessage);
                setOpenErrorAlert(true);
            })
    }


    async function pasteClipboardContentInInput() {
        const clipboardContent = await navigator.clipboard.readText();
        setArticleUrl(clipboardContent);
    }

    const handleCloseAlert = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpenSuccessAlert(false);
        setOpenErrorAlert(false);
    };


    return (
        <>
            <Paper
                component="form"
                sx={{
                    p: '2px 4px',
                    display: 'flex',
                    alignItems: 'center',
                    marginTop: "80px"
                }}
                onSubmit={formSubmitHandler}
            >
                <LinkIcon sx={{ p: '10px' }} aria-label="menu" />
                <InputBase
                    sx={{ ml: 1, flex: 1 }}
                    placeholder="Paste article's url here"
                    inputProps={{ 'aria-label': 'search google maps' }}
                    value={articleUrl}
                    onChange={e => setArticleUrl(e.target.value)}
                />
                <IconButton sx={{ p: '10px' }} aria-label="search" onClick={pasteClipboardContentInInput}>
                    <ContentPasteIcon />
                </IconButton>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    endIcon={<SendIcon />} >
                    Post
                </Button>
            </Paper>
            {isSubmitting &&
                <ArticleCardSkeleton />
            }
            {Object.keys(articlePosted).length !== 0 &&
                <ArticleCard articleInfo={articlePosted} />
            }
            <Snackbar open={openSuccessAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
                <Alert onClose={handleCloseAlert} severity="success" sx={{ width: '100%' }}>
                    New article posted!
                </Alert>
            </Snackbar>
            <Snackbar open={openErrorAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
                <Alert onClose={handleCloseAlert} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </>
    );
}

export default NewArticlePostUrlInput;