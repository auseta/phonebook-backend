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


app.use(express.static('build'));
app.use(express.json())
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

const getDate = () => {
  return new Date()
}

app.get('/info', (request, response) => {
  Person.find({}).then(persons => {
    response.send(
      `<p><b>Phonebook has info for ${persons.length} persons<b/></b>
       <p><b>${getDate()}</b></p>
      `
    )
  })
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(person => {
    response.json(person)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      response.json(person)
    })
    .catch(error => response.status(404).end())
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body;

  if (body.name === undefined) {
    return response.status(400).json({ error: 'name is missing' })
  }
  
  if (body.number === undefined) {
    return response.status(400).json({error: 'number is missing'})
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save()
  .then(savedPerson => {
    response.json(savedPerson)
  })
  .catch(error => next(error))

})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body
  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))

})

const unknownEndpoint = (request, response, next) => {
  return response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.log(error.message);
  console.log(error.name);
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})