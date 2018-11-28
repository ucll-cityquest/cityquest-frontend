import React from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";

export default ({ game }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="headline" component="h2">
          {game.name}
        </Typography>
        <Typography component="p">{game.description}</Typography>
      </CardContent>
    </Card>
  );
};
