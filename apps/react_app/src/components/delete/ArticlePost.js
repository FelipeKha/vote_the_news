import React from "react";
import "../styles/ArticlePost.css"

function ArticlePost(props) {
    return (
      <section className='articlePost'>
        <div className='subGridContainer'>
          <div className='article'>
            <header className='articleImageContainer'>
              <img className='articleImage' src={props.articleInfo.linkPreview.img} />
            </header>
            <div className='articleOverview'>
              <h2 className='articleTitle'>
                {props.articleInfo.linkPreview.title}
              </h2>
              <div className='articleDescription'>
                {props.articleInfo.linkPreview.description}
              </div>
              <div className='newspaperDomain'>
                {props.articleInfo.linkPreview.domain}
              </div>
            </div>
          </div>
          <footer className='stats'>
            <div>
              Ranking: {props.articleInfo.ranking}
            </div>
            <div>
              Number of Votes: {props.articleInfo.numberOfVotes}
            </div>
            <a>+Vote</a>
          </footer>
        </div>
      </section>
    )
  }

  export default ArticlePost