module.exports = ({ config }) => {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    ...config,
    experiments: {
      ...(config.experiments || {}),
      baseUrl: isProduction ? "/mobile" : undefined,
    },
  };
};
