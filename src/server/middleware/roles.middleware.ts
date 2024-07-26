import * as express from 'express';

interface RequestWithRoles extends express.Request {
  payload?: {
    role?: string;
  };
}

export const rolesValidation = (roles: [string, string?, string?]) => {
  return (
    req: RequestWithRoles,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    if (!req.payload || !roles.includes(req.payload.role || '')) {
      return res
        .status(403)
        .json({ message: 'Access forbidden: insufficient rights' });
    }
    next();
  };
};
