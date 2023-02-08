require('dotenv').config()
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');
const app = express();

app.use(cors());

// custom token
morgan.token('bodyJSON', (request, resolve) => {
  return JSON.stringify(request.body)
})

// custom console messages
app.use(morgan((tokens, request, resolve) => {
  return tokens.method(request, resolve) !== 'POST'
    ? [tokens.method(request, resolve),
       tokens.url(request, resolve),
       tokens.res(request, resolve, 'content-length'),
       '-',
       tokens['response-time'](request, resolve),
       'ms'
      ].join(' ')
    : [tokens.method(request, resolve),
      tokens.url(request, resolve),
      tokens.res(request, resolve, 'content-length'),
      '-',
      tokens['response-time'](request, resolve),
      'ms',
      tokens.bodyJSON(request, resolve)
     ].join(' ')
}))

app.use(express.json())
app.use(express.static('build'));

let persons = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456'
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: 3,
    name: 'Dan Abramov',
    number: '12-43-234345'
  },
  {
    id: 4,
    name: 'Mary Poppendick',
    number: '39-23-6423122'
  }
]

const getPersonsAmount = () => {
  return persons.length
}

const getDate = () => {
  return new Date()
}

const generateRandomId = () => {
  const randomId = Math.round(Math.random() * 1000)
  return randomId
}

app.get('/', (request, response) => {
  response.send('<h1>Welcome to my Phonebook API REST</h1>')
})

app.get('/info', (request, response) => {
  response.send(`
    <p><b>Phonebook has info for ${getPersonsAmount()} persons.</b></p>
    <p><b>${getDate()}</b></p>
    `);
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(person => {
    response.json(person)
  })
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    response.json(person)
  })
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter(person => person.id !== id );
  
  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  const body = request.body;

  if (body.name === undefined) {
    return response.status(404).json({ error: 'name is missing' })
  }
  
  if (body.number === undefined) {
    return response.status(404).json({error: 'number is missing'})
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })

})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})