import { Request, Response, NextFunction } from 'express';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function csrfMiddleware(allowedOrigins: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (SAFE_METHODS.has(req.method)) {
      return next();
    }

    const origin = req.headers.origin;
    const referer = req.headers.referer;

    if (origin) {
      if (allowedOrigins.includes(origin)) {
        return next();
      }
      res
        .status(403)
        .json({ message: 'CSRF validation failed: invalid origin' });
      return;
    }

    if (referer) {
      try {
        const refererUrl = new URL(referer);
        const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`;
        if (allowedOrigins.includes(refererOrigin)) {
          return next();
        }
      } catch {
        // invalid referer URL
      }
      res
        .status(403)
        .json({ message: 'CSRF validation failed: invalid referer' });
      return;
    }

    res
      .status(403)
      .json({ message: 'CSRF validation failed: missing origin and referer' });
  };
}
