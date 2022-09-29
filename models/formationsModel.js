// Create table for cars
import mongoose from 'mongoose'

const formationSchema = new mongoose.Schema({

    type: {type: String, required: true},
    title: {type: String, required: true},
    participant: {type: String, required: true},
    imgUrl: {type: String, required: true},
    price: {type: String, required: true},
    formateur: {type: String, required: true},
    lieu: {type: String, required: true},
    duration: {type: String, required: true},
    time: {type: String, required: true},
    description: {type: String, required: true},
    inscription: [
        {
            f_name: {type: String},
            f_date: {type: String},
            f_lastname: {type: String},
            f_tel: {type: String},
            f_email: {type: String},
            f_valid:{type: Boolean},

        }
    ],

}, {
    timestamps: true
});

const Formations = mongoose.model('Cars', formationSchema);
export default Formations;