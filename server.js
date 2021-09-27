'use strict';

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const server = express();
server.use(cors());
server.use(express.json());

const PORT = process.env.PORT;

//Mongoose
const mongoose = require('mongoose');

let flowerModel;
main().catch(err => console.log(err));

async function main() {
    await mongoose.connect(process.env.MONGOOSE_URL,{ useNewUrlParser: true, useUnifiedTopology: true });

    //Mongoose Schemas
    const flowerSchema = new mongoose.Schema({
        name: String,
        photo: String,
        instructions: String,
        ownerEmail: String
    });

    //Mongoose Model
    flowerModel = mongoose.model('flower', flowerSchema);
}




//Routes
server.get('/getFlower', getflowerHandler);
server.post('/addToFav', addToFavHandler);
server.get('/getFavFlower', getFavflowerHandler);
server.put('/updateFav/:id', updateFavHandler);
server.delete('/deleteFav/:id', deleteFavHandler);

//Handlers
function getflowerHandler(req, res) {
    axios
        .get(`https://flowers-api-13.herokuapp.com/getFlowers`)
        
        .then(result => {
            console.log(result.data);
            res.send(result.data.flowerslist);

        })
        .catch(err => {
            res.send(err);
        })
}

async function addToFavHandler(req, res) {
    const { name, photo, instructions, ownerEmail } = req.body;
    await flowerModel.create({
        name: name,
        photo: photo,
        instructions: instructions,
        ownerEmail: ownerEmail
    });


    flowerModel.find({ ownerEmail: ownerEmail }, (err, result) => {
        if (err) {
            console.log(err);
        }
        else {
            res.send(result);
        }
    })
}

function getFavflowerHandler(req, res) {
    const email = req.query.ownerEmail;
    console.log(email)
    flowerModel.find({ ownerEmail: email }, (err, result) => {
        if (err) {
            console.log(err);
        }
        else {
            res.send(result);
        }
    })
}

function updateFavHandler(req, res) {
    const id = req.params.id;
    const { name, photo, instructions, ownerEmail } = req.body;

    flowerModel.findByIdAndUpdate(id, { name, photo, instructions }, (err, result) => {
        flowerModel.find({ ownerEmail: ownerEmail }, (err, result) => {
            if (err) {
                console.log(err);
            }
            else {
                console.log(result);
                res.send(result);
            }
        })
    })
}

function deleteFavHandler(req, res) {
    const id = req.params.id;
    const ownerEmail = req.query.ownerEmail;
    flowerModel.deleteOne({ _id: id }, (err, result) => {

        flowerModel.find({ ownerEmail: ownerEmail }, (err, result) => {
            if (err) {
                console.log(err);
            }
            else {
                res.send(result);
            }
        })

    })
}

server.listen(PORT, () => {
    console.log(`Listening on PORT 3010`);
})