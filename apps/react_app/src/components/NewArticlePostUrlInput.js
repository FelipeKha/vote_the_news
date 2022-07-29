import React, { useContext, useState } from 'react';

import Button from '@mui/material/Button';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import LinkIcon from '@mui/icons-material/Link';
import Paper from '@mui/material/Paper';
import SendIcon from '@mui/icons-material/Send';

import ArticleCard from './ArticleCard';
import ArticleCardSkeleton from './ArticleCardSkeleton';
import { UserContext } from '../context/UserContext';


function NewArticlePostUrlInput() {
    const [userContext, setUserContext] = useContext(UserContext);
    const [articleUrl, setArticleUrl] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [articlePosted, setArticlePosted] = useState({})

    function formSubmitHandler(e) {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        const genericErrorMessage = "Something went wrong, please try again."

        fetch(
            'http://localhost:4000/newarticlepost',
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
                if (response.ok) {
                    const data = await response.json();
                    setArticlePosted(data);
                    setIsSubmitting(false);
                } else {
                    setError("There was an error.")
                }
            })
            .catch(err => {
                setError(genericErrorMessage);
                setIsSubmitting(false)
            })
    }


    async function pasteClipboardContentInInput() {
        const clipboardContent = await navigator.clipboard.readText();
        setArticleUrl(clipboardContent);
    }


    return (
        <>
            <Paper
                component="form"
                sx={{
                    p: '2px 4px',
                    display: 'flex',
                    alignItems: 'center',
                    marginTop: "30px"
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
        </>
    );
}

export default NewArticlePostUrlInput;