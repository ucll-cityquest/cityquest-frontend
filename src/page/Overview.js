import React, { Component } from "react";
import { Link } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";

import { createApiUrl } from "../api";
import Game from "../components/Game";

class Overview extends Component {
  state = {
    fetching: false,
    games: []
  };

  componentDidMount() {
    this.fetchGames();
  }

  async fetchGames() {
    this.setState({ fetching: true });

    try {
      const result = await fetch(createApiUrl("games"));
      const json = await result.json();
      this.setState({
        fetching: false,
        games: json
      });
    } catch (e) {
      this.setState({
        loading: false,
        error: e
      });
    }
  }

  render() {
    const { loading, error, games } = this.state;

    if (loading) {
      return <div>Loading</div>;
    }
    if (error) {
      return <div>Error: {this.state.error.toString()}</div>;
    }

    return (
      <div style={{ padding: 20 }}>
        <Grid container spacing={24}>
          {games.map(game => (
            <Grid item xs={6} key={game.id}>
              <Link to={`/game/play/${game.id}`}>
                <Game key={game.id} game={game} />
              </Link>
            </Grid>
          ))}
        </Grid>
        <Link to="/game/add">
          <Fab color="primary" style={{ marginTop: 10 }}>
            <AddIcon />
          </Fab>
        </Link>
      </div>
    );
  }
}

export default Overview;
