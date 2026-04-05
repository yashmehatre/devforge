const Application = require("./application.model");
const Job = require("../jobs/job.model");
const AppError = require("../../utils/AppError");

const getAllApplications = async ({
  filters = {},
  sort = { createdAt: -1 },
  page = 1,
  limit = 20,
}) => {
  const skip = (page - 1) * limit;
  const [applications, total] = await Promise.all([
    Application.find({ ...filters })
      .sort(sort)
      .limit(limit)
      .skip(skip),
    Application.countDocuments({ ...filters }),
  ]);
  return {
    applications,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

const getApplication = async (userId, applicationId) => {
  const application = await Application.findById(applicationId);
  if (!application) throw new AppError("Application not found", 404);
  if (
    application.applicant.toString() !== userId.toString() &&
    application.company.toString() !== userId.toString()
  ) {
    throw new AppError(
      "You do not have permission to view this application",
      403,
    );
  }
  return { application };
};

const createApplication = async (userId, jobId, applicationData) => {
  const { resume, coverLetter } = applicationData;
  const job = await Job.findById(jobId);
  if (!job) throw new AppError("Job not found", 404);
  const application = await Application.create({
    applicant: userId,
    job: jobId,
    company: job.company,
    resume,
    coverLetter,
  });
  await Job.findByIdAndUpdate(jobId, { $inc: { applicationsCount: 1 } });

  return { application };
};

const updateApplicationStatus = async (
  userId,
  applicationId,
  status,
  userRole,
) => {
  const application = await Application.findById(applicationId);
  if (!application) throw new AppError("Application not found", 404);
  if (
    application.applicant.toString() !== userId.toString() &&
    application.company.toString() !== userId.toString()
  ) {
    throw new AppError(
      "You do not have permission to update status of this application",
      403,
    );
  }
  if (userRole === "developer" && status !== "withdrawn") {
    throw new AppError("Applicants can only withdraw their application", 403);
  }
  application.status = status;
  application.changedBy = userId;
  await application.save();
  return { application };
};

const addApplicationNote = async (userId, applicationId, noteData) => {
  const { note } = noteData;
  const application = await Application.findById(applicationId);
  if (!application) throw new AppError("Application not found", 404);
  if (application.company.toString() !== userId.toString()) {
    throw new AppError(
      "You do not have to permission to add note on this application",
      403,
    );
  }
  application.note = note;
  await application.save({ validateBeforeSave: false });
  return { application };
};

module.exports = {
  getAllApplications,
  getApplication,
  createApplication,
  updateApplicationStatus,
  addApplicationNote,
};
