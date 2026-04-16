const Application = require("./application.model");
const Job = require("../jobs/job.model");
const AppError = require("../../utils/AppError");
const storage = require("../../utils/storage");

const uploadResume = async (applicationId, userId, file) => {
  if (!file) {
    throw new AppError("Please upload a PDF file.", 400);
  }

  const application = await Application.findOne({
    _id: applicationId,
    applicant: userId,
  }).select("+resumeKey");

  if (!application) {
    throw new AppError("Application not found or you do not own it.", 404);
  }

  const { key, url } = await storage.uploadFile(
    file.buffer,
    "resumes",
    "application/pdf",
  );

  await Application.findByIdAndUpdate(applicationId, {
    resume: url,
    resumeKey: key,
  });

  try {
    await storage.deleteFile(application.resumeKey);
  } catch (err) {
    console.error(
      "Failed to delete old resume:",
      application.resumeKey,
      err.message,
    );
  }

  const updatedApplication = await Application.findById(application);
  return updatedApplication;
};

const getResume = async (applicationId, userId, userRole) => {
  const filter =
    userRole === "developer"
      ? { _id: applicationId, applicant: userId }
      : { _id: applicationId, company: userId };

  const application = await Application.findOne(filter).select("+resumeKey");

  if (!application) {
    throw new AppError("Application not found or access denied.", 404);
  }

  if (!application.resumeKey) {
    throw new AppError("No resume uploaded for this application.", 404);
  }

  const url = await storage.getPresignedUrl(application.resumeKey, 900);

  return { url, expiresIn: 900 };
};

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
