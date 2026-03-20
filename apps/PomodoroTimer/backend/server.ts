import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

interface Session {
    id: string;
    duration: number;
    completeAt: number;
}

let sessions: Session[] = []

app.post('/sessions', (req, res) => {
    const {duration} = req.body;
    
    if (!duration || duration <= 0) {
        return res.status(400).json({error: 'Invalid duration'})
    } 

    const newSession: Session = {
        id: Date.now().toString(),
        duration,
        completeAt: Date.now()
    }
    sessions.push(newSession)
    res.status(201).json(newSession)
})

app.get('/sessions', (req, res) => {
    const totalSeconds = sessions.reduce((acc, s) => acc + s.duration, 0)
    
    res.json({
        sessions: [...sessions].reverse(),
        totalSeconds,
        totalMinutes: Math.floor(totalSeconds / 60),
    })
})

app.listen(8001, () => console.log('Backend running on port 8001'))
