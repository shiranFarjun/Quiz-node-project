const fs = require("fs");
const folderUsers = "./users/";


const writeFileQA = (file, obj) => {
    fs.writeFileSync(file, obj, (error) => {      // file is already a json file
        if (error) {
            throw error;
        }
    });
}

const readFile = (file) => {
    const dataBuffer = fs.readFileSync(file);
    const dataJSON = JSON.parse(dataBuffer.toString());
    return dataJSON;
}

const writeFileUser = (file, obj) => {
    if (!fs.existsSync(folderUsers)) {          // If no folder exists create one for users
        fs.mkdir(folderUsers, (err) => {
            if (err) {
                throw err;
            }
        });
    }
    fs.writeFileSync(`${folderUsers}${file}.json`, obj, (error) => {
        if (error) {
            throw error;
        }
    });
};

const readFileUser = (file) => {
    const dataBuffer = fs.readFileSync(
        `${folderUsers}${file}.json`,
        (error) => {
            if (error) {
                throw error;
            }
        },
    );
    const dataJSON = JSON.parse(dataBuffer.toString());
    return dataJSON;
}

///////////  RESPONSE ///////////////////////////

const sendResponse = (response, data, msg, statusCode) => {
    return response.status(statusCode).json({
        msg: msg,
        data,
    });
};

const randomId = () => {
    return Math.floor((1 + Math.random()) * 0x10000)
};


/////////  Request Quiz     //////////

exports.getAllQuiz = (req, res) => {
    try {
        const dataJSON = readFile("quiz.json");
        return sendResponse(res, dataJSON, 'view all quiz', 200);
    } catch (error) {
        throw error;
    }
};

exports.createQuiz = (req, res) => {
    const { question, answer1, answer2, answer3, answer4 } = req.body;
    if (!question || !answer1 || !answer2 || !answer3 || !answer4) {
        return sendResponse(res, null, 'Please provide question and answers', 400);
    }
    const dataJSON = readFile("quiz.json");
    const found = dataJSON.some(el => el.question === question);
    if (found) {
        return sendResponse(res, null, 'Question already exists', 400);
    }
    const newQuiz = {
        question,
        answer1,
        answer2,
        answer3,
        answer4
        // id: text.length + 1
    };
    dataJSON.push(newQuiz);                             //push obj to array
    console.log('dataJSON', dataJSON)                    //print the array
    writeFileQA("quiz.json", JSON.stringify(dataJSON))     //write to the file the new array with the new obj
    return sendResponse(res, dataJSON, 'create obj QA', 200);

};

exports.deleteQuizById = (req, res) => {
    const id = parseInt(req.query.id);
    if (!id) {
        return sendResponse(res, null, 'please provide id', 400);
    }
    const dataJSON = readFile("quiz.json");
    const indexRemove = dataJSON.findIndex(item => item.id === id)
    dataJSON.splice(indexRemove, 1);

    writeFileQA("quiz.json", JSON.stringify(dataJSON))     //write to the file the new array with the new obj
    return sendResponse(res, dataJSON, 'The object quiz was successfully deleted', 200);
};

exports.updateQuizById = (req, res) => {
    const id = parseInt(req.query.id);
    if (!id) {
        return sendResponse(res, null, 'please provide id', 400);
    }

    const dataJSON = readFile("quiz.json");
    const indexRemove = dataJSON.findIndex(item => item.id === id)
    dataJSON.splice(indexRemove, 1);

    const newQuiz = {
        id: id,
        question: req.body.question,
        answer1: req.body.answer1,
        answer2: req.body.answer2,
        answer3: req.body.answer3,
        answer4: req.body.answer4,
        answer5: req.body.answer5
    };

    dataJSON.push(newQuiz);                             //push obj to array
    dataJSON.sort(function (a, b) {
        return a.id - b.id
    });
    writeFileQA("quiz.json", JSON.stringify(dataJSON))     //write to the file the new array with the new obj
    return sendResponse(res, dataJSON, 'The object quiz was successfully update', 200);
};



//////////   Request Users  /////////////

exports.createNewUser = (req, res) => {
    if (!req.params.username) {
        return sendResponse(res, null, 'No username was entered', 400);
    }
    const userName = req.params.username;
    const userId = randomId();
    const newProfile = { name: userName, id: userId };
    writeFileUser(userName, JSON.stringify(newProfile));
    return sendResponse(res, newProfile, 'create base obj User', 200);
};

exports.updateUserAnswers = (req, res) => {
    if (!req.params.username) {
        return sendResponse(res, null, 'No username was entered', 400);
    }
    if (!req.body) {
        return sendResponse(res, null, 'no user answers', 400)
    }
    const userName = req.params.username;
    const userAnswers = req.body;

    const user = readFileUser(userName);                //get the files user
    user.userAnswers = userAnswers;                 //add more property to user of userAnswers that his info come from req.body
    writeFileUser(userName, JSON.stringify(user));
    return sendResponse(res, user, 'User answers updated ', 400)
};

exports.getUser = (req, res) => {
    if (!req.params.username) {
        return sendResponse(res, null, 'no user name was given', 400);
    }
    const userName = req.params.username;
    const user = readFileUser(userName);
    return sendResponse(res, user, 'view profile user ', 400)
};

exports.createNewFriend = (req, res) => {
    if (!req.params.username) {
        return sendResponse(res, null, 'No username was entered', 400);
    }
    if (!req.params.friendName) {
        return sendResponse(res, null, 'Does not have the name of the user\'s friend', 400)
    }
    const userName = req.params.username;                         // the name of user (root)
    const friendName = req.params.friendName;
    const friendId = randomId();

    const fileName = `${userName}-${friendName}-results`;       // Create a folder for a friend with the name of the user he is answering the quiz on

    const newFriendUser = { name: friendName, id: friendId };

    writeFileUser(fileName, JSON.stringify(newFriendUser));
    return sendResponse(res, newFriendUser, 'create friend user', 200);

};

exports.updateFriend = (req, res) => {
    if (!req.params.username) {
        return sendResponse(res, null, 'No username was entered', 400);
    }
    if (!req.params.friendName) {
        return sendResponse(res, null, 'Does not have the name of the user\'s friend', 400)
    }
    if (!req.body) {
        return sendResponse(res, null, 'No answers were received', 400)
    }
    const userName = req.params.username;
    const friendName = req.params.friendName;
    const fileName = `${userName}-${friendName}-results`;
    const newAnswer = req.body;

    const dataFriends = readFileUser(fileName);
    dataFriends.quizAnswers = { ...dataFriends.quizAnswers, ...newAnswer };
    writeFileUser(fileName, JSON.stringify(dataFriends));
    return sendResponse(res, dataFriends, 'The friend\'s answers have been updated', 200);

};

exports.getScore = (req, res) => {
    if (!req.params.username) {
        return sendResponse(res, null, 'No username was entered', 400);
    }
    if (!req.params.friendName) {
        return sendResponse(res, null, 'Does not have the name of the user\'s friend', 400)
    }
    const userName = req.params.username;
    const friendName = req.params.friendName;
    const resultsFileNameFriend = `${userName}-${friendName}-results`;

    const friend = readFileUser(resultsFileNameFriend);
    const user = readFileUser(userName);
    friendAnswers = friend.quizAnswers;
    userAnswers = user.userAnswers;
    const score = calcScore(userAnswers, friendAnswers);        //output => { correct: 3, length: 4 }

    if (!user.friendsScore) {
        user.friendsScore = [];
    }
    user.friendsScore.push({
        friendName: friendName,
        score: score.correct
    });
    friend.correctAnswers = score.correct;
    writeFileUser(userName, JSON.stringify(user));
    writeFileUser(resultsFileNameFriend,JSON.stringify( friend));

    const data= score.correct+'/'+score.length;
    return sendResponse(res,data, 'The score is : ', 200);
};

const calcScore = (obj1, obj2) => {
    let array1 = [];
    let array2 = [];
    for (i in obj1) {
        array1.push(obj1[i])
    }
    for (i in obj2) {
        array2.push(obj2[i])
    }
    var countMatched = 0
    for (let index = 0; index < array1.length; index++) {
        if (array1[index] == array2[index]) {
            countMatched++;

        }
    }
    return { correct: countMatched, length: array1.length };
};

exports.getResults = (req, res) => {
    if (!req.params.username) {
        return sendResponse(res, null, 'No username was entered', 400);
    }
    const userName = req.params.username;
    const user = readFileUser(userName);
    
    let array = [];
    for (i in user.userAnswers) {
        array.push(user.userAnswers[i])
    }
    const length = array.length;
    const data = JSON.stringify({ friendsScore: user.friendsScore, total:length });

    return sendResponse(res, data, 'Get names and results of all friends', 200);
};