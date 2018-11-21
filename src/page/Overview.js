import React, { Component } from "react";
import { Link } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import AddIcon from "@material-ui/icons/Add";

import { createApiUrl } from "../api";
import Game from "../components/Game";

class Overview extends Component {
  constructor() {
    super();
    this.state = {
      fetching: false,
      games: []
    };
  }

  async componentDidMount() {
    this.setState({ fetching: true });
    const result = await fetch(createApiUrl("games"));
    const json = await result.json();
    this.setState({
      fetching: false,
      games: json
    });
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
          <Link to="/game/add">
            <Button variant="fab" color="primary">
              <AddIcon />
            </Button>
          </Link>
        </div>
      </>
    );
  }
}

export default Overview;
