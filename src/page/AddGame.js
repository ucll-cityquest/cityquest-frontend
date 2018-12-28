import React, { Component } from "react";
import TextField from "@material-ui/core/TextField";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { createApiUrl } from "../api";
import { Redirect } from "react-router";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";

const styles = theme => ({
  container: {
    flexWrap: "wrap"
  },
  textField: {
    marginLeft: 50
  },
  dense: {
    marginTop: 16
  },
  menu: {
    width: 200
  },
  h: {
    marginLeft: 50
  },
  addQuestion: {
    backgroundColor: "#f2f2f2",
    display: "inline-block",
    paddingRight: 50
  },
  cardContainer: {
    padding: "0 50px"
  },
  card: {
    minWidth: 275,
    marginTop: 20,
    display: "inline-block",
    backgroundColor: "#fafafa"
  },
  answers: {
    textAlign: "left"
  },
  answer: {
    borderTop: "1px solid gray"
  },
  newQuestionAnswer: {
    display: "inline-block"
  },
  correctAnswer: {
    backgroundColor: "#d4edda"
  },
  title: {
    fontSize: 14
  },
  pos: {
    marginTop: 15,
    marginBottom: 12
  },
  button: {
    marginTop: 16,
    marginLeft: 10
  },
  submit: {
    display: "block"
  }
});

class AddGame extends Component {
  static propTypes = {
    classes: PropTypes.object.isRequired
  };

  state = {
    name: "",
    city: "",
    lat: 0,
    lng: 0,
    description: "",
    newQuestion: {
      question: "",
      lat: 0,
      lng: 0,
      answers: [],
      correctAnswer: -1,
      newAnswer: "",
      comment: ""
    },
    questions: []
  };

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value
    });
  };

  handleChangeQuestion = name => event => {
    this.setState({
      newQuestion: { ...this.state.newQuestion, [name]: event.target.value }
    });
  };

  handleAddAnswer = () => {
    if (!this.state.newQuestion.newAnswer.trim()) return;
    this.setState({
      newQuestion: {
        ...this.state.newQuestion,
        answers: [
          ...this.state.newQuestion.answers,
          this.state.newQuestion.newAnswer
        ],
        newAnswer: ""
      }
    });
  };

  handleAddQuestion = () => {
    if (
      !this.state.newQuestion.question ||
      this.state.newQuestion.correctAnswer === -1
    )
      return;
    this.setState({
      questions: [...this.state.questions, this.state.newQuestion],
      newQuestion: {
        question: "",
        lat: 0,
        lng: 0,
        answers: [],
        correctAnswer: -1,
        newAnswer: "",
        comment: ""
      }
    });
  };

  handleChangeCorrectAnswer = event => {
    let index = Number(event.target.value.substring(1));
    this.setState({
      newQuestion: {
        ...this.state.newQuestion,
        correctAnswer: event.target.checked ? index : -1
      }
    });
  };

  handleDeleteQuestion = index => () => {
    let qs = this.state.questions;
    index = Number(index);
    this.setState({
      questions: qs.slice(0, index).concat(qs.slice(index + 1, qs.length))
    });
  };

  handleSubmit = async () => {
    if (!this.state.name || !this.state.city) return;

    let t = this.state;

    let result = await fetch(createApiUrl("games"), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: t.name,
        location: t.city,
        description: t.description,
        coordinates: { lat: Number(t.lat), lng: Number(t.lng) },
        questions: t.questions.map(e => ({
          question: e.question,
          extraInformation: e.comment,
          coordinates: { lat: Number(e.lat), lng: Number(e.lng) },
          answers: e.answers,
          correctAnswer: e.correctAnswer
        }))
      })
    });
    if (result.ok) {
      this.setState({ toOverview: true });
    }
  };

  render() {
    if (this.state.toOverview) {
      return <Redirect to="/" />;
    }

    const { classes } = this.props;

    return (
      <React.Fragment>
        <h1 className={classes.h}>Add quiz</h1>
        <form className={classes.container} noValidate autoComplete="off">
          <div>
            <TextField
              id="name"
              label="Name"
              className={classes.textField}
              value={this.state.name}
              onChange={this.handleChange("name")}
              margin="normal"
              variant="outlined"
            />
          </div>
          <div>
            <TextField
              id="city"
              label="City"
              className={classes.textField}
              value={this.state.city}
              onChange={this.handleChange("city")}
              margin="normal"
              variant="outlined"
            />
          </div>
          <div>
            <TextField
              id="cityLat"
              label="Latitude"
              className={classes.textField}
              value={this.state.lat}
              onChange={this.handleChange("lat")}
              margin="normal"
              variant="outlined"
            />
            <TextField
              id="cityLng"
              label="Longitude"
              className={classes.textField}
              value={this.state.lng}
              onChange={this.handleChange("lng")}
              margin="normal"
              variant="outlined"
            />
          </div>
          <div>
            <TextField
              id="description"
              label="Description"
              className={classes.textField}
              value={this.state.description}
              onChange={this.handleChange("description")}
              margin="normal"
              variant="outlined"
            />
          </div>
          <h2 className={classes.h}>Questions</h2>
          <div className={classes.addQuestion}>
            <div>
              <TextField
                id="question"
                label="Question"
                className={classes.textField}
                value={this.state.newQuestion.question}
                onChange={this.handleChangeQuestion("question")}
                margin="normal"
                variant="outlined"
              />
            </div>
            <div>
              <TextField
                id="lat"
                label="Latitude"
                className={classes.textField}
                value={this.state.newQuestion.lat}
                onChange={this.handleChangeQuestion("lat")}
                margin="normal"
                variant="outlined"
              />
              <TextField
                id="lng"
                label="Longitude"
                className={classes.textField}
                value={this.state.newQuestion.lng}
                onChange={this.handleChangeQuestion("lng")}
                margin="normal"
                variant="outlined"
              />
            </div>
            {this.state.newQuestion.answers.map((e, i) => (
              <div key={i} style={{ marginLeft: 50 }}>
                <Checkbox
                  value={"i" + i}
                  checked={i === this.state.newQuestion.correctAnswer}
                  onChange={this.handleChangeCorrectAnswer}
                />
                <p className={classes.newQuestionAnswer}>{e}</p>
              </div>
            ))}
            <div>
              <TextField
                id="newAnswer"
                label="New answer"
                className={classes.textField}
                value={this.state.newQuestion.newAnswer}
                onChange={this.handleChangeQuestion("newAnswer")}
                margin="normal"
                variant="outlined"
              />
              <Button
                variant="outlined"
                color="primary"
                className={classes.button}
                onClick={this.handleAddAnswer}
              >
                Add answer
              </Button>
            </div>
            <div>
              <TextField
                id="comment"
                label="Extra information"
                className={classes.textField}
                value={this.state.newQuestion.comment}
                onChange={this.handleChangeQuestion("comment")}
                margin="normal"
                variant="outlined"
              />
            </div>
            <div>
              <Button
                variant="outlined"
                color="primary"
                className={classes.button}
                onClick={this.handleAddQuestion}
                style={{ marginLeft: 50 }}
              >
                Add question
              </Button>
            </div>
          </div>
          {this.state.questions.map((e, i) => (
            <div className={classes.cardContainer} key={i}>
              <Card className={classes.card}>
                <CardContent>
                  <IconButton
                    className={classes.button}
                    aria-label="Delete"
                    onClick={this.handleDeleteQuestion(i)}
                  >
                    <DeleteIcon />
                  </IconButton>
                  <Typography
                    className={classes.title}
                    color="textSecondary"
                    gutterBottom
                  >
                    Question
                  </Typography>
                  <Typography variant="h5" component="h2">
                    {e.question}
                  </Typography>
                  <Typography className={classes.pos} color="textSecondary">
                    lng: {e.lng}, lat: {e.lat}
                  </Typography>
                  <div className={classes.answers}>
                    {e.answers.map((answer, index) => (
                      <Typography
                        key={index}
                        component="p"
                        className={[
                          index > 0 ? classes.answer : "",
                          index === e.correctAnswer ? classes.correctAnswer : ""
                        ].join(" ")}
                      >
                        {answer}
                      </Typography>
                    ))}
                    <Typography className={classes.pos} color="textSecondary">
                      {e.comment}
                    </Typography>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
          <Button
            variant="outlined"
            color="primary"
            className={[classes.button, classes.submit].join(" ")}
            onClick={this.handleSubmit}
            style={{ marginLeft: 50 }}
          >
            Save game
          </Button>
        </form>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(AddGame);
