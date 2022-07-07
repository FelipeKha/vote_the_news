import * as React from 'react';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';

import Button from '@mui/material/Button';

import LinkIcon from '@mui/icons-material/Link';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import SendIcon from '@mui/icons-material/Send';

import FadeIn from 'react-fade-in/lib/FadeIn';

import MyLoader from './Placeholder';
import ImgMediaCard from './ImgMediaCard';

class CustomizedInputBase extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: '',
            waitingForNewArticle: true,
            thereIsMessageForUser: false,
            userMessage: '',
            newArticleLoading: true,
            lastArticlePosted: {}
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.pasteClipboardContentInInput = this.pasteClipboardContentInInput.bind(this)
    }

    handleChange(event) {
        this.setState({ value: event.target.value });
    }

    handleSubmit(event) {
        event.preventDefault();
        this.setState({
            waitingForNewArticle: false,
            newArticleLoading: true
        })
        this.sendNewArticleURL();
    }

    handleNewPost(newArticlesList) {
        this.props.onArticlePosted(newArticlesList);
    }

    sendNewArticleURL() {
        const bodyObject = {
            url: this.state.value
        }

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bodyObject)
        }

        fetch('http://localhost:4000/', requestOptions)
            .then(res => res.json())
            .then(
                (result) => {
                    if (result.userMessage && result.linkPreview) {
                        console.log(result);
                        this.setState({
                            userMessage: result.userMessage,
                            newArticleLoading: false,
                            lastArticlePosted: result
                        })
                    } else if (result.linkPreview) {
                        this.setState({
                            newArticleLoading: false,
                            lastArticlePosted: result
                        })
                    } else if (result.userMessage) {
                        this.setState({
                            userMessage: result.userMessage,
                            waitingForNewArticle: true
                        })
                    }
                    // this.handleNewPost(result);
                }
            )
    }

    renderNewArticlePostPreview() {
        if (!this.state.waitingForNewArticle) {
            return (
                this.state.newArticleLoading ? (
                    <FadeIn>
                        <MyLoader />
                    </FadeIn>
                ) : (
                    <FadeIn>
                        <ImgMediaCard
                            articleInfo={this.state.lastArticlePosted}
                        />
                    </FadeIn>
                )
            )
        }
    }

    renderUserMessage() {
        return (
            <span className="userMessage">{this.state.userMessage}</span>
        )
    }

    async pasteClipboardContentInInput() {
        const clipboardContent = await navigator.clipboard.readText();
        this.setState({ value: clipboardContent });
    }


    render() {
        return (
            <>
                <Paper
                    component="form"
                    sx={{ p: '2px 4px', display: 'flex', alignItems: 'center' }}
                    onSubmit={this.handleSubmit}
                >
                    <LinkIcon sx={{ p: '10px' }} aria-label="menu" />
                    <InputBase
                        sx={{ ml: 1, flex: 1 }}
                        placeholder="Paste article's url here"
                        inputProps={{ 'aria-label': 'search google maps' }}
                        value={this.state.value}
                        onChange={this.handleChange}
                    />
                    <IconButton sx={{ p: '10px' }} aria-label="search" onClick={this.pasteClipboardContentInInput}>
                        <ContentPasteIcon />
                    </IconButton>
                    <Button type="submit" variant="contained" endIcon={<SendIcon />} >
                        Post
                    </Button>
                </Paper>
                {this.renderUserMessage()}
                {this.renderNewArticlePostPreview()}
            </>
        );
    }
}

export default CustomizedInputBase;