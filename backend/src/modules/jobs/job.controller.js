const JobService = require("./job.service");
const catchAsync = require("../../utils/catchAsync");

const getAllJobs = catchAsync(async (req, res, next) => {
  const filterFields = [
    "employmentType",
    "experienceLevel",
    "educationRequirement",
    "location",
    "publishedAt",
    "isFeatured",
  ];
  const { page, limit, minSalary, maxSalary } = req.query;
  let filters = {};
  filters.status = req.query.status || "published";
  const sort = req.query.sort ? req.query.sort.split(",").join(" ") : undefined;
  filterFields.forEach((field) => {
    if (req.query[field] !== undefined) {
      filters[field] = req.query[field];
    }
  });
  if (req.query.isRemote !== undefined) {
    filters.isRemote = req.query.isRemote === "true";
  }
  if (req.query.skills) {
    filters.skills = { $in: req.query.skills.split(",") };
  }
  if (minSalary) filters["salary.min"] = { $gte: Number(minSalary) };
  if (maxSalary) filters["salary.max"] = { $lte: Number(maxSalary) };
  const { jobs, total, totalPages } = await JobService.getAllJobs({
    filters,
    sort,
    page,
    limit,
  });
  res.status(200).json({
    status: "success",
    total,
    page,
    limit,
    totalPages,
    data: { jobs },
  });
});

const getJob = catchAsync(async (req, res, next) => {
  const { slug } = req.params;
  const { job } = await JobService.getJob(slug);
  res.status(200).json({
    status: "success",
    data: { job },
  });
});

const createJob = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const jobData = req.body;
  const { job } = await JobService.createJob(userId, jobData);
  res.status(201).json({
    status: "success",
    data: { job },
  });
});

const updateJob = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { slug } = req.params;
  const updateData = req.body;
  const { job } = await JobService.updateJob(userId, slug, updateData);
  res.status(200).json({
    status: "success",
    data: { job },
  });
});

const deleteJob = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { slug } = req.params;
  await JobService.deleteJob(userId, slug);
  res.status(204).send();
});

const updateJobStatus = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { slug } = req.params;
  const { status } = req.body;
  const { job } = await JobService.updateJobStatus(userId, slug, status);
  res.status(200).json({
    status: "success",
    data: { job },
  });
});

const featureJob = catchAsync(async (req, res, next) => {
  const { slug } = req.params;
  const { isFeatured } = req.body;
  const { job } = await JobService.featureJob(slug, isFeatured);
  res.status(200).json({
    status: "success",
    data: { job },
  });
});

module.exports = {
  getAllJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  updateJobStatus,
  featureJob,
};
