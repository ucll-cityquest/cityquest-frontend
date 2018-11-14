import React, { Component } from 'react';
import { createApiUrl } from "./api"

class App extends Component {
  constructor() {
    super();
    this.state = {
      fetching: false,
      games: []
    }
  }

  componentDidMount() {
    this.setState({ fetching: true });
    console.log(createApiUrl);
    fetch(createApiUrl("games"))
      .then(res => res.json())
      .then(json => this.setState({
        fetching: false,
        games: json
      }));
  }

  render() {
    return (
      <>
        {this.state.fetching && <div>Loading</div>}
        {this.state.games.map(game => <pre key="{game.id}">{JSON.stringify(game)}</pre>)}
      </>
    )
  }
}

export default App;
