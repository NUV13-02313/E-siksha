const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    level: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced']
    },
    price: {
        type: Number,
        default: 0
    },
    instructor: {
        type: String,
        required: true
    },
    duration: {
        type: String
    },
    thumbnail: {
        type: String
    },
    videos: [{
        title: String,
        url: String,
        duration: String
    }],
    notes: [{
        title: String,
        fileUrl: String,
        fileType: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Course', CourseSchema);