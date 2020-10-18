const quizControl = require("./controllerQuiz");
const express = require('express')


const app = express()
app.use(express.json());



//////////////// Request  -  Quiz    ///////////////////////////////

app.get('/quiz', quizControl.getAllQuiz);

app.post('/quiz/createQuiz', quizControl.createQuiz);

app.delete('/quiz/deleteQuizById', quizControl.deleteQuizById);

app.put('/quiz/updateQuizById', quizControl.updateQuizById)



/////////        User Request     /////////////

app.get("/quiz/:username", quizControl.getUser);

app.post("/quiz/:username/create", quizControl.createNewUser);

app.put("/quiz/:username/update", quizControl.updateUserAnswers);


/////// Request for friends   //////////////////

app.post("/quiz/:username/answer/:friendName/create", quizControl.createNewFriend);

app.put("/quiz/:username/answer/:friendName/update", quizControl.updateFriend);

app.put( "/quiz/:username/answer/:friendName/getScore",quizControl.getScore);
  
app.get("/quiz/results/:username", quizControl.getResults);


app.listen(3006, () => {
    console.log('Server is up on port 3006.')
})

node_modules