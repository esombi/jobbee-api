const mongoose = require('mongoose');
const validator = require('validator');
const slugify = require('slugify');
const geoCoder = require('../utils/geocoder')

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please enter job title.'],
        trim: true,
        maxLength: [100, 'Job title cannot exceed 100 characters. ']
    },
    slug: String,
    description: {
        type: String,
        required: [true, 'Please enter Job description. '],
        maxLength: [1000, 'description cannot be more than 1000 characters. ']
    },
    email: {
        type: String,
        validate: [validator.isEmail, 'Please enter a valid email address']
    },
    address: {
        type: String,
        required: [true, 'Please add an address.']
    },
    location: {
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: {
            type: [Number],
            index: '2dsphere'
        },
        formattedAddress : String,
        city: String,
        state: String,
        zipcode: String,
        country: String
    },
    company: {
        type: String,
        required: [true, 'please add company name.']
    },
    industry: {
        type: [String],
        required: [true, 'Please enter Industry for this Job'],
        enum: {
            values: [
                'Business',
                'Information Technology',
                'Banking',
                'Education/Training',
                'Telecommunication',
                'Others'
            ],
            message: 'Please select correct option form industry.'
        }
    },
    jobType: {
        type: String,
        required: [true, ' Please enter job type'],
        enum: {
            values: [
                'Permanent',
                'Temporary',
                'Internship'
            ],
            message: 'Please select correct options for job type.'
        }
    },
    minEducation: {
        type: String,
        required: [true, 'Please enter minimum Education for this job'],
        enum: {
            values: [
                'Bachelors',
                'Masters',
                'Phd'
            ],
            message: 'Please select the correct option for Education'
        }
    },
    positions: {
        type: Number,
        default: 1
    },
    experience: {
        type: String,
        required: [true, 'Please enter experience required for this job'],
        enum: {
            values: [
                'No Experience',
                '1 Year - 2 Years',
                '2 Years - 5 Years',
                '5 Years+'
            ],
            message: 'Please select the correct option for Experience'
        }
    },
    salary: {
        type: Number,
        required: [true, 'Please enter the expected salary for this job.']
    },
    postingDate: {
        type: Date,
        default: Date.now
    },
    lastDate: {
        type: Date,
        default: new Date().setDate(new Date().getDate() + 7)
    },
    applicantsApplied: {
        type: [Object],
        select: false
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User', 
        required: true
    }
});

//creating job slug before saving
jobSchema.pre('save', function (next) {
    this.slug = slugify(this.title, {lower: true})

    next();
})

//setting up location
jobSchema.pre('save', async function(){
    const loc = await geoCoder.geocode(this.address);

    this.location = {
        type: 'Point',
        coordinates: [loc[0].longitude, loc[0].latitude],
        formattedAddress: loc[0].formattedAddress,
        city: loc[0].city,
        state: loc[0].stateCode,
        zipcode: loc[0].zipcode,
        country: loc[0].countryCode
    }
});

module.exports = mongoose.model('Job', jobSchema);