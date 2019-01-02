import React from "react";
import { Formik, Field, FieldArray } from "formik";
import * as Yup from "yup";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import { TextField } from "formik-material-ui";
import { withRouter } from "react-router-dom";
import { createApiUrl } from "../api";
import { RadioButton, RadioButtonGroup } from "../components/FormikHelpers";
import { findIndexOr } from "../util";

const emptyQuestion = () => ({
  id: Math.random(),
  question: "",
  latitude: 0,
  longitude: 0,
  answers: [],
  correctAnswer: -1,
  newAnswer: "",
  extraInformation: ""
});

const latSchema = Yup.number()
  .required()
  .min(-90)
  .max(+90);
const lngSchema = Yup.number()
  .required()
  .min(-180)
  .max(+180);

const schema = Yup.object().shape({
  name: Yup.string().required(),
  city: Yup.string().required(),
  latitude: latSchema,
  longitude: lngSchema,
  description: Yup.string().required(),
  questions: Yup.array()
    .required()
    .of(
      Yup.object().shape({
        question: Yup.string().required(),
        latitude: latSchema,
        longitude: lngSchema,
        answers: Yup.array()
          .required()
          .of(
            Yup.object().shape({
              value: Yup.string().required()
            })
          ),
        correctAnswer: Yup.string().required("A correct answer is required"),
        extraInformation: Yup.string().notRequired()
      })
    )
});

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

const AddGame = ({ classes, history }) => {
  const initialValues = {
    name: "",
    city: "",
    latitude: 0,
    longitude: 0,
    description: "",
    questions: [emptyQuestion()]
  };

  const submit = async (values, { setSubmitting }) => {
    const body = JSON.stringify({
      name: values.name,
      location: values.city,
      description: values.description,
      coordinates: {
        lat: Number.parseFloat(values.latitude, 10),
        lng: Number.parseFloat(values.longitude, 10)
      },
      questions: values.questions.map(question => ({
        question: question.question,
        extraInformation: question.extraInformation,
        coordinates: {
          lat: Number.parseFloat(question.latitude, 10),
          lng: Number.parseFloat(question.longitude, 10)
        },
        answers: question.answers.map(answer => answer.value),
        correctAnswer: findIndexOr(
          question.answers,
          answer => answer === question.correctAnswer,
          0
        )
      }))
    });

    let result = await fetch(createApiUrl("games"), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body
    });

    setSubmitting(false);

    if (result.ok) {
      history.push("/");
    } else {
      throw new Error(result.status, result.statusText);
    }
  };

  return (
    <>
      <h1 className={classes.h}>Add quiz</h1>
      <Formik
        initialValues={initialValues}
        onSubmit={submit}
        validationSchema={schema}
      >
        {props => {
          const {
            values,
            errors,
            touched,
            isSubmitting,
            handleSubmit,
            isValid
          } = props;

          return (
            <form
              className={classes.container}
              onSubmit={handleSubmit}
              noValidate
              autoComplete="off"
            >
              <div>
                <Field name="name" placeholder="Name" component={TextField} />
              </div>
              <div>
                <Field name="city" placeholder="City" component={TextField} />
              </div>
              <div>
                <Field name="latitude" placeholder="0" component={TextField} />
                <Field name="longitude" placeholder="0" component={TextField} />
              </div>
              <div>
                <Field
                  name="description"
                  placeholder="description"
                  component={TextField}
                />
              </div>
              <h2 className={classes.h}>Questions</h2>
              <FieldArray
                name="questions"
                render={arrayHelper => (
                  <div className={classes.addQuestion}>
                    {values.questions.map((question, questionIndex) => {
                      const createName = str =>
                        `questions[${questionIndex}].${str}`;
                      return (
                        <div key={question.id} style={{ marginBottom: 50 }}>
                          <div>
                            <Field
                              name={createName("question")}
                              placeholder="question"
                              component={TextField}
                            />
                          </div>
                          <div>
                            <Field
                              name={createName("latitude")}
                              placeholder="latitude"
                              component={TextField}
                            />
                            <Field
                              name={createName("longitude")}
                              placeholder="longtitude"
                              component={TextField}
                            />
                            <RadioButtonGroup
                              id="correctAnswer"
                              label="Answers"
                              value={
                                values.questions[questionIndex].correctAnswer
                              }
                              error={
                                errors.questions &&
                                errors.questions[questionIndex] &&
                                errors.questions[questionIndex].correctAnswer
                              }
                              touched={
                                touched.questions &&
                                touched.questions[questionIndex] &&
                                touched.questions[questionIndex].correctAnswer
                              }
                            >
                              {question.answers.map(({ id, value }) => (
                                <Field
                                  component={RadioButton}
                                  id={value}
                                  label={value}
                                  key={id}
                                  name={createName(`correctAnswer`)}
                                />
                              ))}
                            </RadioButtonGroup>
                          </div>
                          <div>
                            <Field name={createName("newAnswer")} />
                            <Button
                              variant="outlined"
                              color="primary"
                              className={classes.button}
                              onClick={() => {
                                arrayHelper.replace(questionIndex, {
                                  ...question,
                                  answers: [
                                    ...question.answers,
                                    {
                                      id: Math.random(),
                                      value: question.newAnswer
                                    }
                                  ],
                                  newAnswer: ""
                                });
                              }}
                              //onClick={handleSubmit}
                              disabled={question.newAnswer.trim() === ""}
                            >
                              Add answer
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                    <Button
                      variant="outlined"
                      color="primary"
                      className={classes.button}
                      onClick={() => arrayHelper.push(emptyQuestion())}
                    >
                      Add new Question
                    </Button>
                  </div>
                )}
              />

              <Button
                type="submit"
                variant="outlined"
                color="primary"
                className={[classes.button, classes.submit].join(" ")}
                style={{ marginLeft: 50 }}
                disabled={!(isSubmitting || isValid)}
              >
                Save game
              </Button>
            </form>
          );
        }}
      </Formik>
    </>
  );
};

export default withStyles(styles)(withRouter(AddGame));
