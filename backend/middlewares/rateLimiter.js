import rateLimit from "express-rate-limit";

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message:
      "Too many requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  handler: (req, res) => {
    console.log("Rate limit triggered:", req.ip);

    res.status(429).json({
      success: false,
      message: "Too many requests",
    });
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export const uploadPDFLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100  upload requests per windowMs
  message: {
    success: false,
    message:
      "Too many upload requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export const uploadImagesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100  upload requests per windowMs
  message: {
    success: false,
    message:
      "Too many upload requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export const editReportLimiter = rateLimit({
  windowMs: 20 * 60 * 1000, // 20  minutes
  max: 100, // Limit each IP to 100  upload requests per windowMs
  message: {
    success: false,
    message:
      "Too many upload requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export const patrolReportLimiter = rateLimit({
  windowMs: 20 * 60 * 1000, // 20  minutes
  max: 100, // Limit each IP to 100  upload requests per windowMs
  message: {
    success: false,
    message:
      "Too many upload requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export const reportImagesLimiter = rateLimit({
  windowMs: 20 * 60 * 1000, // 20  minutes
  max: 100, // Limit each IP to 100  upload requests per windowMs
  message: {
    success: false,
    message:
      "Too many upload requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export const workLocationLimiter = rateLimit({
  windowMs: 20 * 60 * 1000, // 20  minutes
  max: 100, // Limit each IP to 100  upload requests per windowMs
  message: {
    success: false,
    message:
      "Too many upload requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
