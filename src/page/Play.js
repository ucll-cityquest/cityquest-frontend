import React from "react";
import PropTypes from "prop-types";
import { createApiUrl } from "../api";
import { Map, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import { createLocationStream } from "../geolocation";
import Distance from "node-geo-distance";
const radius = 28150;

class Play extends React.Component {
  static proptypes = {
    match: PropTypes.shape({
      parms: PropTypes.shape({
        id: PropTypes.string.isRequired
      }).isRequired
    }).isRequired
  };

  state = {
    loading: true,
    loadingStartLocation: true,
    startingLocation: [0, 0],
    location: [0, 0],
    game: {
      questions: []
    }
  };

  async componentDidMount() {
    this.close = createLocationStream(location => {
      let otherProps = {};
      let startingProps = {};

      if (this.state.loadingStartLocation) {
        startingProps.loadingStartLocation = false;
        startingProps.startingLocation = location;
      }
      this.state.game.questions.forEach(el => {
        Distance.vincenty(
          { latitude: location[0], longitude: location[1] },
          { latitude: el.coordinates.lat, longitude: el.coordinates.lng },
          diff => {
            if (isNaN(diff)) return;
            diff = Number(diff);
            if (diff <= radius) {
              this.displayQuestion(el);
            }
          }
        );
      });

      this.setState({ location, ...startingProps, ...otherProps });
    });
    const id = this.props.match.params.id;
    this.setState({ loading: true });

    try {
      const download = await fetch(createApiUrl(`games/${id}`));
      const result = await download.json();
      this.setState({
        game: result
      });
    } catch (error) {
      this.setState({ error });
    } finally {
      this.setState({
        loading: false
      });
    }
  }

  componentWillUnmount() {
    this.close();
  }

  displayQuestion() {
    console.log("Question being displayed...");
    // TODO: SHOW QUESTION
    // NEEDS QUESTION QUEUES, SINCE MULTIPLE QUESTIONS CAN BE ASKED AT THE SAME TIME
    // TODO: HIDE MAP, STATE QUESTION MODE BOOLEAN VARIABLE?
  }

  render() {
    const { loading, error, game } = this.state;
    if (loading) {
      return <h1>Loading game</h1>;
    }
    if (error) {
      return <h1 style={{ color: "red" }}>{error.toString()}</h1>;
    }
    return (
      <div style={{ marginLeft: 50 }}>
        <h1>{game.name}</h1>
        <h4>{game.description}</h4>
        <h4>
          {game.location} ({game.coordinates.lat}, {game.coordinates.lng})
        </h4>
        <p>
          Your curent location is: ({this.state.location[0]},{" "}
          {this.state.location[1]})
        </p>
        <Map
          center={this.state.startingLocation}
          zoom={15}
          style={
            this.state.loadingStartLocation
              ? { visibility: "hidden", width: 800, height: 400 }
              : { visibility: "visible", width: 800, height: 400 }
          }
        >
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
          />
          <Marker position={this.state.location}>
            <Popup>
              <span>You are here!</span>
            </Popup>
          </Marker>
          {this.state.game.questions.map(el => (
            <React.Fragment>
              <Marker position={[el.coordinates.lat, el.coordinates.lng]}>
                <Popup>
                  <span>Question: {el.question}</span>
                </Popup>
              </Marker>
              <Circle
                center={[el.coordinates.lat, el.coordinates.lng]}
                radius={radius}
              >
                <Popup>
                  <span>Radius for question: {el.question}</span>
                </Popup>
              </Circle>
            </React.Fragment>
          ))}
        </Map>
      </div>
    );
  }
}

export default Play;
