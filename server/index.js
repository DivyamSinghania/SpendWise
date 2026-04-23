const mongoose = require('mongoose');

// Connect to MongoDB (Default port is 27017)
// 'myDatabase' will be created automatically
mongoose.connect('mongodb://127.0.0.1:27017/newdb')
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('Could not connect to MongoDB...', err))
    
    const userSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    age: Number,
    date: { type: Date, default: Date.now }
}, { collection: 'User' });

// 3. Create a Model/Collection
const User = mongoose.model('User', userSchema);
// 4. Storing data into Collection
async function createUser() {
    const user = new User({
        firstname: 'Ram',
        lastname: 'Kumar',
        username: 'Ram123',
        email: 'ram123@example.com',
        age: 30
    });

    try {
        const result = await user.save();
        console.log('Data stored successfully:', result);
    } catch (ex) {
        console.log('Error:', ex.message);
    } finally {
        // Close connection when done
        mongoose.disconnect();
        console.log("Connection Closed!");
    }
}

createUser();