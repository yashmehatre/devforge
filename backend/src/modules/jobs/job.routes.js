const express = require("express");
const JobController = require("./job.controller");
const {
  protect,
  optionalProtect,
  restrictTo,
} = require("../auth/auth.middleware");
const validate = require("../../utils/validate");
const {
  createJobSchema,
  updateJobSchema,
  updateJobStatusSchema,
  featureJobSchema,
} = require("./job.validation");

const router = express.Router();

router.get("/", optionalProtect, JobController.getAllJobs);
router.post("/", protect, validate(createJobSchema), JobController.createJob);
router.patch(
  "/:slug/status",
  protect,
  validate(updateJobStatusSchema),
  JobController.updateJobStatus,
);
router.patch(
  "/:slug/feature",
  protect,
  restrictTo("admin"),
  JobController.featureJob,
);
router.get("/:slug", JobController.getJob);
router.patch(
  "/:slug",
  protect,
  validate(updateJobSchema),
  JobController.updateJob,
);
router.delete("/:slug", protect, JobController.deleteJob);

module.exports = router;
