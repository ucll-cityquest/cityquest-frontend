import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import AddIcon from "@material-ui/icons/Add";

import { createApiUrl } from "./api";
import Game from "./Game";

class App extends Component {
  constructor() {
    super();
    this.state = {
      fetching: false,
      games: []
    };
  }

  componentDidMount() {
    this.setState({ fetching: true });
    fetch(createApiUrl("games"))
      .then(res => res.json())
      .then(json =>
        this.setState({
          fetching: false,
          games: json
        })
      );
  }

  render() {
    return (
      <>
        {this.state.fetching && <div>Loading</div>}
        <div style={{ padding: 20 }}>
          <Grid container spacing={24}>
            {this.state.games.map(game => (
              <Grid item xs={6}>
                <Game key="{game.id}" game={game} />
              </Grid>
            ))}
          </Grid>
          <Button variant="fab" color="primary">
            <AddIcon />
          </Button>
        </div>
      </>
    );
  }
}

export default App;
