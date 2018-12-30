import React, { Component } from "react";
import { Link } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";

import { createApiUrl } from "../api";
import Game from "../components/Game";
import { getUserId } from "../util";

class Overview extends Component {
  state = {
    fetching: false,
    games: []
  };

  componentDidMount() {
    this.fetchGames();
  }

  sortGames(games, ratings) {
    let nums = Object.keys(ratings).map(key => ratings[key]);
    nums.sort((a, b) => b - a);
    let result = [];
    let prevnum = -1;
    nums.forEach(num => {
      if (num === prevnum) return;
      prevnum = num;
      games.forEach(game => {
        if (ratings[game.id] === num) result.push(game);
      });
    });
    games.forEach(game => {
      if (ratings[game.id] === undefined) result.push(game);
    });

    return result;
  }

  async fetchGames() {
    this.setState({ fetching: true });
    try {
      const result = await fetch(createApiUrl("games"));
      const result2 = await fetch(
        createApiUrl("games/recommended/" + getUserId())
      );
      let json = await result.json();
      try {
        let json2 = await result2.json();
        json = this.sortGames(json, json2);
      } catch (error) {}
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
