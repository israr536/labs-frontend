// Simple console-only logger (Sentry integration removed)

function captureException(err: any) {
  // eslint-disable-next-line no-console
  console.error(err);
}

function info(...args: any[]) {
  // eslint-disable-next-line no-console
  console.info(...args);
}

function warn(...args: any[]) {
  // eslint-disable-next-line no-console
  console.warn(...args);
}

function error(...args: any[]) {
  // eslint-disable-next-line no-console
  console.error(...args);
  try {
    if (args && args.length) captureException(args[0]);
  } catch {}
}

export default {
  info,
  warn,
  error,
  captureException,
};
