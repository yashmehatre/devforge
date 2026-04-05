const ApplicationService = require("./application.service");
const catchAsync = require("../../utils/catchAsync");

const getAllApplications = catchAsync(async (req, res, next) => {
  const { page, limit } = req.query;
  const sort = req.query.sort ? req.query.sort.split(",").join(" ") : undefined;
  const filters = {};
  if (req.user.role === "developer") {
    filters.applicant = req.user._id;
    if (req.query.status) filters.status = req.query.status;
    if (req.query.job) filters.job = req.query.job;
  } else if (req.user.role === "company") {
    filters.company = req.user._id;
    if (req.query.status) filters.status = req.query.status;
    if (req.query.job) filters.job = req.query.job;
    if (req.query.applicant) filters.applicant = req.query.applicant;
  }
  const { applications, total, totalPages } =
    await ApplicationService.getAllApplications({ filters, sort, page, limit });
  res.status(200).json({
    status: "success",
    total,
    page,
    limit,
    totalPages,
    data: { applications },
  });
});

const getApplication = catchAsync(async (req, res, next) => {
  const { applicationId } = req.params;
  const userId = req.user._id;
  const { application } = await ApplicationService.getApplication(
    userId,
    applicationId,
  );
  res.status(200).json({
    status: "success",
    data: { application },
  });
});

const createApplication = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const jobId = req.params.jobId || req.body.jobId;
  const applicationData = req.body;
  const { application } = await ApplicationService.createApplication(
    userId,
    jobId,
    applicationData,
  );
  res.status(201).json({
    status: "success",
    data: { application },
  });
});

const updateApplicationStatus = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const userRole = req.user.role;
  const { applicationId } = req.params;
  const { status } = req.body;
  const { application } = await ApplicationService.updateApplicationStatus(
    userId,
    applicationId,
    status,
    userRole,
  );
  res.status(200).json({
    status: "success",
    data: { application },
  });
});

const addApplicationNote = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { applicationId } = req.params;
  const noteData = req.body;
  const { application } = await ApplicationService.addApplicationNote(
    userId,
    applicationId,
    noteData,
  );
  res.status(200).json({
    status: "success",
    data: { application },
  });
});

module.exports = {
  getAllApplications,
  getApplication,
  createApplication,
  updateApplicationStatus,
  addApplicationNote,
};
