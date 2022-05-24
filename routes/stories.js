const express = require('express')
const router = express.Router()
const { ensureAuth } = require('../middleware/auth')

const Story = require('../models/Story')

//@dsc  Show add page
//@route GET /stories/add
router.get('/add', ensureAuth, (req, res) => {
    res.render('stories/add')
})

//@dsc  Process add Form
//@route POST /stories/add
router.post('/', ensureAuth, async (req, res) => {
    try {
       req.body.user = req.user.id
       await Story.create(req.body)
       res.redirect('/dashboard')
    } catch (err) {
       console.error(err)
       res.render('error/500') 
    }
})

//@dsc  Show all Stories
//@route GET /stories
router.get('/', ensureAuth, async (req, res) => {
    try {
        const stories = await Story.find({ status: 'public' })
        .populate('user')
        .sort({ createdAt: 'desc' })
        .lean()

        res.render('stories/index', {
            stories,
        })
    } catch (err) {
        console.error(err)
       res.render('error/500')
        
    }
})

//@dsc  Show Single Story
//@route GET /stories/add
router.get('/:id', ensureAuth, async (req, res) => {
    try {
        let story = await Story.findById(req.params.id)
        .populate('user')
        .lean()

        if (!story) {
            return res.render('error/404')
        }

        res.render('stories/show', {
            story
        })
    } catch (err) {
        console.error(err)
        return res.render('error/404') 
    }
})

//@dsc  Show edit page
//@route GET /stories/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {
    try {
        const story = await Story.findOne({
            _id: req.params.id
        }).lean()
    
        if(!story) {
            return res.render('error/404')
        }
    
        if(story.user != req.user.id) {
            res.redirect('/stories')
        } else {
            res.render('stories/edit', {
                story,
            })
        }
    } catch (err) {
        console.error(err)
        return res.render('error/500')  
    }
})

//@dsc  Update story
//@route PUT /stories/:id
router.put('/:id', ensureAuth, async (req, res) => {
    try {
        let story = await Story.findById(req.params.id).lean()
    if(!story) {
        return res.render('error/404')
    }

    if(story.user != req.user.id) {
        res.redirect('/stories')
    } else {
        story = await Story.findOneAndUpdate({ _id: req.params.id }, req.body, {
            new: true,
            runValidators: true
        })

        res.redirect('/dashboard')
    }
    } catch (err) {
        console.error(err)
        return res.render('error/500')  
    }
})

//@dsc  Delete Story
//@route GET /stories/:id
router.delete('/:id', ensureAuth, async (req, res) => {
    try {
        await Story.deleteOne({ _id: req.params.id })
        res.redirect('/dashboard')
    } catch (err) {
        console.error(err)
        return res.render('error/500')
    }
})

//@dsc  User Stories
//@route GET /stories/user/:userid
router.get('/user/:userid', ensureAuth, async (req, res) => {
    try {
        const stories = await Story.find({
            user: req.params.userId,
        status: 'public'        
    })
    .populate('user')
    .lean()

    res.render('stories/index', {
        stories
    })
    } catch (err) {
       console.error(err)
       res.render('error/500') 
    }
})
   
   



module.exports = router
