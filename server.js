import express from 'express';
import mongoose from 'mongoose';
import Messages from './dbMessages.js';
import Pusher from 'pusher';
import cors from 'cors';

const port = process.env.PORT || 9000;
const app = express();
// middleware
app.use(express.json()); 
app.use(cors());

//pusher
const pusher = new Pusher({
 
});



// DB config
const connection_url = "mongodb+srv://piyushy:Piyush1212@cluster0.p6ouxtb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
mongoose.connect(connection_url)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err))

const db = mongoose.connection;
db.once('open', () => {
    console.log('DB connected');

    const msgCollection = db.collection('messagecontents');
    const changeStream = msgCollection.watch();

    changeStream.on('change', (change) => {
        console.log('A change occurred', change);

        if(change.operationType === 'insert'){
            const messageDetails = change.fullDocument;
            pusher.trigger('messages', 'inserted', {
                name: messageDetails.name,
                message: messageDetails.message,
                // timestamp: messageDetails.timestamp,
                // received: messageDetails.received
            });
        } else {
            console.log('Error triggering Pusher');
        }
    });
})


app.get('/messages/sync', async (req, res) => {
    try{
        const data = await Messages.find();
        res.status(200).send(data);
    }
    catch(err){
        res.status(500).send(err);
    }
})


app.post('/messages/new', async (req, res) => {
    const dbMessage = req.body;

    try {
        const data = await Messages.create(dbMessage);
        res.status(201).send(data);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.listen(port, ()=> console.log(`Listening on localhost: ${port}`));
