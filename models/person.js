const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator'); 

mongoose.set('strictQuery', false);

const url = process.env.MONGODB_URI;

console.log('connecting to url', url);

mongoose.connect(url)
  .then(result => {
    console.log('Connected to MongoDB');
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message);
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: String,
    validate: {
      validator: function(v) {
        return /^[0-9]{2}-[0-9]{7}$/.test(v) || /^[0-9]{3}-[0-9]{8}$/.test(v)
      },
      message: props => `${props.value} is not a valid phone number`
    },
    required: [true, 'User phone number required']
  },
})

personSchema.plugin(uniqueValidator)

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)