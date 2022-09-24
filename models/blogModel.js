// Create table for cars
import mongoose from 'mongoose'

const blogsSchema = new mongoose.Schema({


    title: {type: String, required: true},
    author: {type: String, required: true},
    date: {type: String, required: true},
    time: {type: String, required: true},
    imgUrl: {type: String, required: true},
    description:{type: String, required: true},
    quote:{type: String, required: true},
    comments: [
        {
            c_user: {type: String},
            c_date: {type: String},
            c_comment: {type: String}
        }
    ],

}, {
    timestamps: true
});

const Blogs = mongoose.model('Blogs', blogsSchema);
export default Blogs;