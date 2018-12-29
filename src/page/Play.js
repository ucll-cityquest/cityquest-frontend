import React from "react";
import PropTypes from "prop-types";
import { createApiUrl } from "../api";
import Modal from "react-responsive-modal";
import { Map, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import { createLocationStream } from "../geolocation";
const radius = 50;

const styles = {
  answer: {
    borderBottom: "1px solid black"
  }
};

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
    modalOpen: false,
    loadingStartLocation: true,
    showMap: false,
    startingLocation: [0, 0],
    location: [0, 0],
    game: {
      questions: [],
      coordinates: { lat: 0, lng: 0 }
    },
    activeQuestionsQueue: [],
    ignoredQuestions: [],
    activeQuestion: null,
    dev: {
      modN: 0,
      modE: 0
    }
  };

  async componentDidMount() {
    this.startGeoLocation();
    this.setState({ loading: true });
    this.loadGame();
  }

  async loadGame() {
    try {
      const download = await fetch(
        createApiUrl(`games/${this.props.match.params.id}`)
      );
      if (!download.ok) {
        this.setState({ game: null });
        return;
      }
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

  startGeoLocation() {
    this.close = createLocationStream(location => {
      let otherProps = {};
      let startingProps = {};

      if (this.state.loadingStartLocation) {
        startingProps.loadingStartLocation = false;
        startingProps.showMap = true;
        startingProps.startingLocation = location;
      }
      location[0] += this.state.dev.modN;
      location[1] += this.state.dev.modE;
      this.updateActiveQuestions();
      this.setState({ location, ...startingProps, ...otherProps });
    });
  }

  updateActiveQuestions() {
    const isQuestionInRadius = el => {
      function getDistance(origin, destination) {
        // return distance in meters
        var lon1 = toRadian(origin[1]),
          lat1 = toRadian(origin[0]),
          lon2 = toRadian(destination[1]),
          lat2 = toRadian(destination[0]);

        var deltaLat = lat2 - lat1;
        var deltaLon = lon2 - lon1;

        var a =
          Math.pow(Math.sin(deltaLat / 2), 2) +
          Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(deltaLon / 2), 2);
        var c = 2 * Math.asin(Math.sqrt(a));
        var EARTH_RADIUS = 6371;
        return c * EARTH_RADIUS * 1000;
      }
      function toRadian(degree) {
        return (degree * Math.PI) / 180;
      }

      let diff = getDistance(this.state.location, [
        el.coordinates.lat,
        el.coordinates.lng
      ]);
      return diff <= radius;
    };

    const activeQuestionSetter = () => {
      // SETTING NEW ACTIVE QUESTION IF NECESSARY
      if (
        !this.state.activeQuestion &&
        this.state.activeQuestionsQueue.length > 0
      ) {
        for (let i = 0; i < this.state.activeQuestionsQueue.length; i++) {
          let item = this.state.activeQuestionsQueue[i];
          if (!item.selectedAnswer || item.selectedAnswer === -1) {
            this.setState({ activeQuestion: item, modalOpen: true });
            return;
          }
        }
      }
    };

    let count = 0;
    this.state.game.questions.forEach(el => {
      let res1 = this.isQuestionInArray(el, this.state.activeQuestionsQueue);
      let res2 = this.isQuestionInArray(el, this.state.ignoredQuestions);

      if (!isQuestionInRadius(el)) {
        let props = {};
        // REMOVING ITEM FROM ACTIVE QUESTIONS QUEUE
        if (res1 !== false)
          props.activeQuestionsQueue = this.state.activeQuestionsQueue.filter(
            (_, i) => res1 !== i
          );
        if (
          this.state.activeQuestion &&
          el.id === this.state.activeQuestion.id
        ) {
          props.activeQuestion = null;
          props.modalOpen = false;
        }

        // REMOVING ITEM FROM IGNORED QUESTIONS
        if (res2 !== false)
          props.ignoredQuestions = this.state.ignoredQuestions.filter(
            (_, i) => res2 !== i
          );

        this.setState(props);
        return;
      }
      if (
        this.isQuestionInArray(el, this.state.activeQuestionsQueue) === false &&
        this.isQuestionInArray(el, this.state.ignoredQuestions) === false
      ) {
        this.setState(
          { activeQuestionsQueue: [...this.state.activeQuestionsQueue, el] },
          () => {
            if (++count === this.state.game.questions.length)
              activeQuestionSetter();
          }
        );
      }
    });
  }

  isQuestionInArray(question, array) {
    for (let i = 0; i < array.length; i++) {
      if (array[i].id === question.id) {
        return i;
      }
    }
    return false;
  }

  componentWillUnmount() {
    this.close();
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
          Your current location is: ({this.state.location[0]},{" "}
          {this.state.location[1]})
        </p>
        {this.state.showMap && this.renderMap()}
        <button
          onClick={() => {
            this.setState({
              dev: { ...this.state.dev, modE: this.state.dev.modE + 0.001 },
              location: [this.state.location[0] + 0.001, this.state.location[1]]
            });
            this.updateActiveQuestions();
          }}
        >
          UP
        </button>
        <button
          onClick={() => {
            this.setState({
              dev: { ...this.state.dev, modE: this.state.dev.modE - 0.001 },
              location: [this.state.location[0] - 0.001, this.state.location[1]]
            });
            this.updateActiveQuestions();
          }}
        >
          DOWN
        </button>
        <button
          onClick={() => {
            this.setState({
              dev: { ...this.state.dev, modN: this.state.dev.modN + 0.001 },
              location: [this.state.location[0], this.state.location[1] + 0.001]
            });
            this.updateActiveQuestions();
          }}
        >
          RIGHT
        </button>
        <button
          onClick={() => {
            this.setState({
              dev: { ...this.state.dev, modN: this.state.dev.modN - 0.001 },
              location: [this.state.location[0], this.state.location[1] - 0.001]
            });
            this.updateActiveQuestions();
          }}
        >
          LEFT
        </button>
        {this.state.game !== null &&
          this.state.activeQuestion !== null &&
          this.renderActiveQuestion()}
      </div>
    );
  }

  renderMap() {
    return (
      <Map
        center={this.state.startingLocation}
        zoom={15}
        style={{ width: 800, height: 400 }}
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
          <React.Fragment key={el.id}>
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
    );
  }

  onOpenModal() {
    this.setState({ modalOpen: true });
  }

  onCloseModal() {
    this.setState({ modalOpen: false });
  }

  renderActiveQuestion() {
    let {
      id,
      question,
      extraInformation,
      answers,
      correctAnswer
    } = this.state.activeQuestion;
    return (
      <div>
        <button onClick={this.onOpenModal.bind(this)}>Open modal</button>
        <Modal
          open={this.state.modalOpen}
          onClose={this.onCloseModal.bind(this)}
          center
        >
          <h2>{question}</h2>
          {answers.map((el, i) => (
            <p id={"answer" + { i }} className={styles.answer}>
              {el}
            </p>
          ))}
          <button>Submit</button>
        </Modal>
      </div>
    );
  }
}

export default Play;
