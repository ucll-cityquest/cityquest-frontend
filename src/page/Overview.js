import React, { Component } from "react";
import { Link } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";

import { createApiUrl } from "../api";
import Game from "../components/Game";
import { createLocationStream } from "../geolocation";

class Overview extends Component {
  state = {
    fetching: false,
    games: [],
    location: [0, 0]
  };

  componentDidMount() {
    this.fetchGames();
    this.close = createLocationStream(location => this.setState({ location }));
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

  componentWillUnmount() {
    this.close();
  }

  render() {
    const {
      loading,
      error,
      games,
      location: [lat, lng]
    } = this.state;

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
          <Fab color="primary">
            <AddIcon />
          </Fab>
        </Link>
        <p>
          Your curent location is: ({lat}, {lng})
        </p>
      </div>
    );
  }
}

export default Overview;
