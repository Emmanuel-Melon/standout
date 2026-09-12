const isDevelopment = process.env.NODE_ENV !== "production";

export const setupLoki = async () => {
  const { infraConfig } = await import("../config/index.js");

  if (isDevelopment && infraConfig?.loki) {
    try {
      const pinoLoki = await import("pino-loki");
      const lokiStream = (pinoLoki.default || pinoLoki)({
        host: infraConfig.loki.host,
        labels: infraConfig.loki.labels,
        ...(infraConfig.loki.batching && { batching: undefined }),
      });

      console.log("sending streams to loki");
      return { stream: lokiStream };
    } catch (e) {
      console.error("Loki stream failed to load", e);
      return null;
    }
  }
  return null;
};
