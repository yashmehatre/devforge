const Job = require("./job.model");
const AppError = require("../../utils/AppError");

const getAllJobs = async ({
  filters = {},
  sort = { publishedAt: -1 },
  page = 1,
  limit = 20,
}) => {
  const skip = (page - 1) * limit;
  const query = { ...filters };
  const [jobs, total] = await Promise.all([
    Job.find(query).sort(sort).limit(limit).skip(skip),
    Job.countDocuments(query),
  ]);
  return { jobs, total, page, limit, totalPages: Math.ceil(total / limit) };
};

const getJob = async (slug) => {
  const job = await Job.findOneAndUpdate(
    { slug },
    { $inc: { viewsCount: 1 } },
    { new: true },
  );
  if (!job) throw new AppError("Job not found", 404);
  return { job };
};

const createJob = async (userId, jobData) => {
  const allowedFields = [
    "title",
    "description",
    "responsibilities",
    "requirements",
    "benefits",
    "employmentType",
    "experienceLevel",
    "educationRequirement",
    "skills",
    "salary",
    "location",
    "isRemote",
  ];
  const creates = {};
  allowedFields.forEach((field) => {
    if (jobData[field] !== undefined) {
      creates[field] = jobData[field];
    }
  });
  const job = await Job.create({
    ...creates,
    company: userId,
  });
  return { job };
};

const updateJob = async (userId, slug, updateData) => {
  const allowedFields = [
    "title",
    "description",
    "responsibilities",
    "requirements",
    "benefits",
    "employmentType",
    "experienceLevel",
    "educationRequirement",
    "skills",
    "salary",
    "location",
    "isRemote",
  ];

  const updates = {};
  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      updates[field] = updateData[field];
    }
  });
  const job = await Job.findOne({ slug });
  if (!job) throw new AppError("Job not found", 404);
  if (job.company.toString() !== userId.toString()) {
    throw new AppError("You do not have permission to update this job", 403);
  }
  Object.assign(job, updates);
  await job.save();
  return { job };
};

const deleteJob = async (userId, slug) => {
  const job = await Job.findOne({ slug });
  if (!job) throw new AppError("Job not found", 404);
  if (job.company.toString() !== userId.toString()) {
    throw new AppError("You do not have permission to delete this job", 403);
  }
  job.isActive = false;
  await job.save({ validateBeforeSave: false });
};

const updateJobStatus = async (userId, slug, status) => {
  const job = await Job.findOne({ slug });
  if (!job) throw new AppError("Job not found", 404);
  if (job.company.toString() !== userId.toString()) {
    throw new AppError(
      "You do not have permission to update the job status",
      403,
    );
  }
  if (status === "published") {
    job.status = "published";
    if (!job.publishedAt) job.publishedAt = Date.now();
    await job.save();
  } else {
    job.status = status;
    await job.save({ validateBeforeSave: false });
  }
  return { job };
};

const featureJob = async (slug, isFeatured) => {
  const job = await Job.findOneAndUpdate(
    { slug },
    { isFeatured },
    { new: true },
  );
  if (!job) throw new AppError("Job not found", 404);
  return { job };
};

module.exports = {
  getAllJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  updateJobStatus,
  featureJob,
};
