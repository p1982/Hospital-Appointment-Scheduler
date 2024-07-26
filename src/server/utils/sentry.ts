import Sentry from '@sentry/node';
import { RewriteFrames } from '@sentry/integrations';

Sentry.init({
  dsn: 'https://9241ae5619a44adebdb7583c97569704@o4505075338444800.ingest.sentry.io/4505075350568960',
  tracesSampleRate: 1.0,
  integrations: [
    new RewriteFrames({
      root: global.__dirname,
    }),
  ],
});

const sentryLog = (e: Error) => {
  Sentry.captureException(e);
};

export default sentryLog;
