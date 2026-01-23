import * as Sentry from "@sentry/react";

Sentry.init({
   dsn: "https://aa3244ac1743eb0c1ee98f56d77b64d3@o4510625186054144.ingest.us.sentry.io/4510625188282368",
   // Adds request headers and IP for users, for more info visit:
   // https://docs.sentry.io/platforms/javascript/guides/react/configuration/options/#sendDefaultPii
   sendDefaultPii: true,
   enableLogs: true,
   integrations:
      import.meta.env.VITE_HIDE_FEEDBACK === "true"
         ? []
         : [
              Sentry.feedbackIntegration({
                 colorScheme: "system",
                 showEmail: false,
                 triggerLabel: "Leave Feedback",
                 formTitle: "Leave Feedback",
                 submitButtonLabel: "Submit Feedback",
                 messagePlaceholder: "Feature request, bug report, etc...",
              }),
           ],
});
