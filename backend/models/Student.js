import mongoose from 'mongoose';

const studentSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    course: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    }
});

// Transform _id to id when converting to JSON
studentSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

const Student = mongoose.model('Student', studentSchema);
export default Student;
