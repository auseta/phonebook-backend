const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();

app.use(cors())

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

app.get('/info', (request, response) => {
  response.send(`
    <p><b>Phonebook has info for ${getPersonsAmount()} persons.</b></p>
    <p><b>${getDate()}</b></p>
    `);
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find(person => person.id === id);
  
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }

})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter(person => person.id !== id );
  
  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  const body = request.body;

  console.log('body', body);

  if (!body.name) {
    response.status(404).json({
      error: 'name is missing.'
    })
  } else if (persons.find(person => person.name === body.name)) {
    response.status(404).json({
      error: 'name must be unique.'
    })
  } else if (!body.number) {
    response.status(404).json({
      error: 'number is missing'
    })
  } else if (persons.find(person => person.number === body.number)) {
    response.status(404).json({
      error: 'number must be unique'
    })
  }

  const person = {
    id: generateRandomId(),
    name: body.name,
    number: body.number
  }

  persons = persons.concat(person);

  response.json(persons)

})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})