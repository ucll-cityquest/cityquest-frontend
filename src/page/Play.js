import React from "react";
import PropTypes from "prop-types";
import { createApiUrl } from "../api";

class Play extends React.Component {
  static proptypes = {
    match: PropTypes.shape({
      parms: PropTypes.shape({
        id: PropTypes.string.isRequired
      }).isRequired
    }).isRequired
  };

  state = {
    loading: true
  };

  async componentDidMount() {
    const id = this.props.match.params.id;

    this.setState({
      loading: true
    });

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

  render() {
    const { loading, error, game } = this.state;
    if (loading) {
      return <h1>Loading game</h1>;
    }
    if (error) {
      return <h1 style={{ color: "red" }}>{error.toString()}</h1>;
    }
    return (
      <ul>
        <li>Name: {game.name}</li>
        <li>Description: {game.description}</li>
        <li>
          Location: ({game.coordinates.lat}, {game.coordinates.lng})
        </li>
        <li>Questions: {this.questionList(game)}</li>
      </ul>
    );
  }

  questionList(game) {
    return (
      <ul>
        {game.questions.map(question => {
          const {
            id,
            extraInformation,
            coordinates: { lat, lng }
          } = question;
          return (
            <ul key={id}>
              <li>Question: {question.question}</li>
              <li>Extra information: {extraInformation}</li>
              <li>
                Coordinates: ({lat}, {lng})
              </li>
              <li>Answers: {this.answerList(question)}</li>
            </ul>
          );
        })}
      </ul>
    );
  }

  answerList(question) {
    const { answers } = question;
    return (
      <ul>
        {answers.map((answer, index) => (
          <li
            key={answer}
            onClick={() => {
              const correct = index === question.correctAnswer;
              console.log(correct);
            }}
          >
            {answer}
          </li>
        ))}
      </ul>
    );
  }
}

export default Play;
