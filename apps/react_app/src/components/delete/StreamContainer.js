import React from "react";

import NewArticleForm from "./NewArticleForm";
import ImgMediaCard from "../ArticleCard";

class StreamContainer extends React.Component {
    constructor(props) {
        super(props);
        this.handleNewArticlePosted = this.handleNewArticlePosted.bind(this);
        this.state = {
            error: null,
            isLoaded: false,
            items: []
        }
    }

    componentDidMount() {
        fetch("http://localhost:4000/")
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        isLoaded: true,
                        items: result
                    });
                },
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error
                    });
                }
            )
    }

    handleNewArticlePosted(newArticlesList) {
        this.setState({ items: newArticlesList })
    }

    renderArticlePost(articleInfo) {
        return (
            <ImgMediaCard
                articleInfo={articleInfo}
                key={articleInfo.id}
            />
        );
    }

    render() {
        return (
            <>
                <main className='streamContainer'>
                    <NewArticleForm
                        onArticlePosted={this.handleNewArticlePosted}
                    />
                    {this.state.items.map((item) => this.renderArticlePost(item))}
                </main>
            </>
        );
    }
}

export default StreamContainer