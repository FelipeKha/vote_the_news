import React from "react";
import MyLoader from "./Placeholder";
import FadeIn from "react-fade-in/lib/FadeIn";
import "../styles/NewArticleForm.css"
import ArticlePost from "./ArticlePost";

class NewArticleForm extends React.Component {
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
    this.sendNewArticleURL()
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
            <ArticlePost
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
      <div className="newArticleFormContainer">
        <form onSubmit={this.handleSubmit} className="newArticleForm">
          <div className="newArticleFormAndButton">
            <input type="text" placeholder="Paste article's URL here to post" value={this.state.value} onChange={this.handleChange} className="newArticleUrlInput" />
            <a onClick={this.pasteClipboardContentInInput} className="pasteClipboardLink">Paste</a>
          </div>
          <input type="submit" value="Post" className="submitNewArticleFormButton" />
        </form>
        <section className='newArticlePostOverview'>
          {this.renderUserMessage()}
          {this.renderNewArticlePostPreview()}
        </section>
      </div>
    );
  }
}

export default NewArticleForm