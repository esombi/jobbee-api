const express = require("express");
const router = express.Router();

//importing jobs controller method
const { 
    getJobs,
    getJob,
     newJob,
     getJobInRadius,
     updateJob, 
     deleteJob,
     jobStats,
     applyJob 
    } = require("../controllers/jobController");

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

router.route("/jobs").get(getJobs);
router.route("/job/:id/:slug").get(getJob);
router.route("/stats/:topic").get(jobStats);
router.route('/job/new').post(isAuthenticatedUser, authorizeRoles('employer', 'admin'), newJob);
router.route('/jobs/:zipcode/:distance').get(getJobInRadius);
router.route('/job/:id/apply').put(isAuthenticatedUser, authorizeRoles('user'),applyJob );

router.route('/job/:id')
            .put(isAuthenticatedUser, authorizeRoles('employer', 'admin'), updateJob)
            .delete(isAuthenticatedUser, authorizeRoles('employer', 'admin'), deleteJob);

module.exports = router;

 