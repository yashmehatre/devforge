const config = require("../../config/env");

const adapters = {
  local: () => require("./localAdapter"),
  s3: () => require("./s3Adapter"),
};

const adapter = config.upload.storageAdapter;

if (!adapters[adapter]) {
  throw new Error(
    `Invalid STORAGE_ADAPTER value: "${adapter}". ` +
      'Expected "local" or "s3".',
  );
}

module.exports = adapters[adapter]();
