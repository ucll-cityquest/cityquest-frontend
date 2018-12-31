import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Overview from "./page/Overview";
import AddGameOld from "./page/AddGame";
import AddGame from "./page/AddGameFormik";
import Play from "./page/Play";

// TODO: save generated user id in localstorage & read from localstorage to load id if it exists

const App = () => (
  <Router>
    <React.Fragment>
      <Route exact path="/" component={Overview} />
      <Route exact path="/game/addOld" component={AddGameOld} />
      <Route exact path="/game/add" component={AddGame} />
      <Route exact path="/game/play/:id" component={Play} />
    </React.Fragment>
  </Router>
);
export default App;
