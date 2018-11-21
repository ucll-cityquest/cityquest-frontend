import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Overview from "./page/Overview";

const App = () => (
  <Router>
    <Route exact path="/" component={Overview} />
  </Router>
);

export default App;
