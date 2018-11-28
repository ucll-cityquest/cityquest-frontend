import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Overview from "./page/Overview";
import AddGame from "./page/AddGame";
import Play from "./page/Play";

const App = () => (
  <Router>
    <React.Fragment>
      <Route exact path="/" component={Overview} />
      <Route exact path="/game/add" component={AddGame} />
      <Route path="/game/:id" component={Play} />
    </React.Fragment>
  </Router>
);
export default App;
