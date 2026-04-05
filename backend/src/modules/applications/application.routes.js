const express = require("express");
const ApplicationController = require("./application.controller");
const validate = require("../../utils/validate");
const {
  createApplicationSchema,
  updateApplicationStatusSchema,
  addApplicationNoteSchema,
} = require("./application.validation");
const { protect, restrictTo } = require("../auth/auth.middleware");

const router = express.Router({ mergeParams: true });

router.get("/", protect, ApplicationController.getAllApplications);
router.post(
  "/",
  protect,
  validate(createApplicationSchema),
  ApplicationController.createApplication,
);
router.patch(
  "/:applicationId/status",
  protect,
  validate(updateApplicationStatusSchema),
  ApplicationController.updateApplicationStatus,
);
router.patch(
  "/:applicationId/note",
  protect,
  restrictTo("company"),
  validate(addApplicationNoteSchema),
  ApplicationController.addApplicationNote,
);
router.get("/:applicationId", protect, ApplicationController.getApplication);

module.exports = router;
