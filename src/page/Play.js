import React from "react";
import PropTypes from "prop-types";
import { createApiUrl } from "../api";
import Modal from "react-responsive-modal";
import { Map, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import { createLocationStream } from "../geolocation";
import { getUserId } from "../util";
import { Redirect } from "react-router";
const radius = 50;

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
    toOverview: false,
    modalOpen: false,
    modal2Open: false,
    modalEndOpen: false,
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
        this.setState({ game: null, error: "Game could not be found." });
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
      this.setState({ location, ...startingProps, ...otherProps }, () =>
        this.updateActiveQuestions()
      );
    });
  }

  checkEnd() {
    let end = true;
    this.state.game.questions.forEach(el => {
      if (el.selectedAnswer === undefined || el.selectedAnswer === -1)
        end = false;
    });
    if (end) {
    }
  }

  updateActiveQuestions() {
    if (this.state.error) return;
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

    let activeQuestionsQueue = [...this.state.activeQuestionsQueue];
    let ignoredQuestions = [...this.state.ignoredQuestions];
    let activeQuestion =
      this.state.activeQuestion === null
        ? null
        : { ...this.state.activeQuestion };
    let modalOpen = this.state.modalOpen;
    let setNew = false;

    const activeQuestionSetter = () => {
      // SETTING NEW ACTIVE QUESTION IF NECESSARY
      if (!activeQuestion && activeQuestionsQueue.length > 0) {
        for (let i = 0; i < activeQuestionsQueue.length; i++) {
          let item = activeQuestionsQueue[i];
          if (item.selectedAnswer === undefined || item.selectedAnswer === -1) {
            item.selectedAnswer = -1;
            this.setState(
              {
                activeQuestion,
                activeQuestionsQueue,
                ignoredQuestions,
                modalOpen
              },
              () =>
                this.setState({ activeQuestion: item, modalOpen: true }, () =>
                  this.checkEnd()
                )
            );
            return;
          }
        }
      }
    };

    this.state.game.questions.forEach(el => {
      let res1 = this.isQuestionInArray(el, activeQuestionsQueue);
      let res2 = this.isQuestionInArray(el, ignoredQuestions);

      if (!isQuestionInRadius(el)) {
        // REMOVING ITEM FROM ACTIVE QUESTIONS QUEUE
        if (res1 !== false)
          activeQuestionsQueue = activeQuestionsQueue.filter(
            (_, i) => res1 !== i
          );
        if (
          this.state.activeQuestion &&
          el.id === this.state.activeQuestion.id
        ) {
          activeQuestion = null;
          modalOpen = false;
        }

        // REMOVING ITEM FROM IGNORED QUESTIONS
        if (res2 !== false)
          ignoredQuestions = ignoredQuestions.filter((_, i) => res2 !== i);
        return;
      }
      if (
        this.isQuestionInArray(el, activeQuestionsQueue) === false &&
        this.isQuestionInArray(el, ignoredQuestions) === false
      ) {
        activeQuestionsQueue = [...activeQuestionsQueue, el];
      }
      if (
        this.isQuestionInArray(el, activeQuestionsQueue) !== false &&
        activeQuestion === null &&
        (el.selectedAnswer === undefined || el.selectedAnswer === -1)
      ) {
        setNew = true;
      }
    });
    if (setNew) {
      activeQuestionSetter();
    } else {
      this.setState(
        {
          activeQuestion,
          activeQuestionsQueue,
          ignoredQuestions,
          modalOpen
        },
        () => this.checkEnd()
      );
    }
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
    if (this.state.toOverview) {
      return <Redirect to="/" />;
    }
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
        {this.renderEndModal()}
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
        {this.state.game.questions.map(el =>
          el.selectedAnswer !== undefined && el.selectedAnswer !== -1 ? (
            <></>
          ) : (
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
          )
        )}
      </Map>
    );
  }

  onCloseModal() {
    this.setState(
      {
        modalOpen: false,
        activeQuestionsQueue: this.state.activeQuestionsQueue.filter(
          e => e.id !== this.state.activeQuestion.id
        ),
        ignoredQuestions: [
          ...this.state.ignoredQuestions,
          this.state.activeQuestion
        ],
        activeQuestion: null
      },
      () => this.updateActiveQuestions()
    );
  }

  onCloseModal2() {
    this.setState({ modal2Open: false, activeQuestion: null }, () => {
      this.updateActiveQuestions();
      setTimeout(() => {
        let end = true;
        this.state.game.questions.forEach(question => {
          if (
            question.selectedAnswer === undefined ||
            question.selectedAnswer === -1
          )
            end = false;
        });
        if (end) this.setState({ modalEndOpen: true });
      }, 2000);
    });
  }

  selectAnswer(index) {
    this.setState({
      activeQuestion: { ...this.state.activeQuestion, selectedAnswer: index }
    });
  }

  submitAnswer() {
    let questions = [];
    this.state.game.questions.forEach(el => {
      if (el.id === this.state.activeQuestion.id) {
        el.selectedAnswer = this.state.activeQuestion.selectedAnswer;
      }
      questions.push({ ...el });
    });
    this.setState(
      { game: { ...this.state.game, questions }, modalOpen: false },
      () => setTimeout(() => this.setState({ modal2Open: true }), 200)
    );
  }

  renderActiveQuestion() {
    let {
      question,
      answers,
      selectedAnswer,
      correctAnswer,
      extraInformation
    } = this.state.activeQuestion;
    return (
      <div>
        <Modal
          open={this.state.modalOpen}
          onClose={this.onCloseModal.bind(this)}
          center
        >
          <h2>{question}</h2>
          {answers.map((el, i) => (
            <div style={{ display: "flex" }}>
              <span
                onClick={() => this.selectAnswer(i)}
                className={
                  selectedAnswer === i ? "answer selectedAnswer" : "answer"
                }
              >
                {el}
              </span>
            </div>
          ))}
          <button style={{ marginTop: 20 }} onClick={() => this.submitAnswer()}>
            Submit
          </button>
        </Modal>
        <Modal
          open={this.state.modal2Open}
          onClose={this.onCloseModal2.bind(this)}
          center
        >
          <h2>
            {selectedAnswer === correctAnswer
              ? "Congratulations, that was correct!"
              : "Bummer, that was wrong!"}
          </h2>
          <p>{extraInformation}</p>
        </Modal>
      </div>
    );
  }

  onCloseEndModal() {
    this.setState({ modalEndOpen: false, toOverview: true });
  }

  async rateGame(rating) {
    await fetch(createApiUrl("games/" + this.state.game.id + "/rate"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        gameId: this.state.game.id,
        userId: getUserId(),
        rating
      })
    });
    this.onCloseEndModal();
  }

  renderEndModal() {
    return (
      <Modal
        open={this.state.modalEndOpen}
        onClose={this.onCloseEndModal.bind(this)}
        center
      >
        <h2>Thank you for playing this game.</h2>
        <h3>Please rate it!</h3>
        <div className={"score-container"}>
          <span onClick={() => this.rateGame(1)} className={"score-item"}>
            1
          </span>
          <span onClick={() => this.rateGame(2)} className={"score-item"}>
            2
          </span>
          <span onClick={() => this.rateGame(3)} className={"score-item"}>
            3
          </span>
          <span onClick={() => this.rateGame(4)} className={"score-item"}>
            4
          </span>
          <span onClick={() => this.rateGame(5)} className={"score-item"}>
            5
          </span>
        </div>
      </Modal>
    );
  }
}

export default Play;
