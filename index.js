const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/playground')
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('Could not connect to MongoDB...', err))

const courseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlenght: 100,
        // match: /pattern/ 
    },
    category: {
        type: String,
        required: true,
        lowercase: true,
        uppercase: true,
        trim: true,
        enum: ['web', 'mobile', 'network']
    },
    author: String,
    tags: {
        type: Array,
        validate: {
            isAsync: true,
            validator: function(v, callback) {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        const result = v && v.length > 0;
                        resolve(result);
                    }, 1000);
                });
            },
            message: 'A course should have at least one tag.'
        }
    },
    date: { type: Date, default: Date.now },
    isPublished: Boolean,
    price: {
        type: Number,
        required: function() { return this.isPublished },
        min: 10,
        max: 200,
        set: v => Math.round(v),
        get: v => Math.round(v)
    }
}, {
    toObject: { getters: true, setters: true },
    toJSON: { getters: true, setters: true },
    // runSettersOnQuery: true
})

const Course = mongoose.model('Course', courseSchema)

const course = new Course({
    name: 'Angular 8 Course',
    category: 'Web ',
    author: 'Mosh',
    tags: ['frontend'],
    isPublished: true,
    price: 14.4
})

const createCourse = async() => {
    try {
        const result = await course.save()
        console.log(result)
    } catch (ex) {
        for (field in ex.errors)
            console.log(ex.errors[field].message)
    }
}

// eq equal
// ne not equal
// gt greater than
// gte greater than or equal
// lt less than
// lte less than or equal
// in
// nin not in

const getCourse = async() => {
    const pageNum = 2
    const pageSize = 10
    const courses = await Course
        .find(
            // {
            // author: 'Mosh',
            // isPublished: true
            // }
        )
        // Pagination
        // .skip((pageNum - 1) * pageSize)
        // .limit(pageSize)
        // .find({ price: { $gt: 10, $lt: 20 } })
        // .find({ price: { $in: [10, 15, 20] } })
        // .or([{ author: 'Mosh' }, { isPublished: true }])

    // Starts with mosh
    // .find({ author: /^Mosh/ })

    // Ends with hamedani + case sensitive
    // .find({ author: /hamedani$/i })

    // Contains Mosh
    // .find({ author: /.*Mosh.*/i })

    .sort({ name: 1 })
        .select({ name: 1, tags: 1, price: 1 })
    console.log(courses)
}

const countCourse = async() => {
    const courses = await Course
        .find({
            author: 'Mosh',
            isPublished: true
        })
        .limit(10)
        .sort({ name: 1 })
        .count()
    console.log(courses)
}

const updateCourse = async(id) => {
    try {
        const course = await Course.findById(id)

        if (course.isPublished === true) {
            console.log('the course is already published')
            return
        }

        // course.isPublished = true
        // course.author = 'Osama'

        course.set({
            isPublished: true,
            author: 'Osama'
        })

        const result = await course.save()
        console.log(result)
    } catch (err) {
        console.log('the course is not existed. ')
    }
}

const updateGroupDirectlyBasedParam = async(id) => {
    const result = await Course.updateMany({ isPublished: false }, {
        $set: {
            author: 'mosh',
            isPublished: true
        }
    })

    console.log(result)
}


const updateDirectlyBasedID = async(id) => {
    // document before updating to get the new set new to true
    const result = await Course.findByIdAndUpdate(id, {
        $set: {
            author: 'osama',
            isPublished: true
        }
    }, { new: true })

    console.log(result)
}

const removeCourse = async(id) => {
    const result = await Course.deleteOne({ _id: id })
        // const course = await Course.findByIdAndRemove({ _id: id })
    console.log(result)
}

getCourse()