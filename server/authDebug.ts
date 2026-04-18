export function shouldIncludeAuthDebug(req: any) {
  const isProd = process.env.NODE_ENV === "production";
  if (!isProd) return true;

  // In production, only include debug if explicitly enabled.
  const envEnabled = process.env.AUTH_DEBUG === "true";
  const queryEnabled = req?.query?.authDebug === "1" || req?.query?.authDebug === "true";
  return envEnabled || queryEnabled;
}

function getHeader(req: any, name: string): string | undefined {
  const value = req?.get?.(name) ?? req?.headers?.[name.toLowerCase()];
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.join(", ");
  return undefined;
}

function getAuthHeaderInfo(req: any) {
  const authorization = getHeader(req, "authorization");
  if (!authorization) return { present: false as const };

  const [schemeRaw] = authorization.split(/\s+/, 1);
  const scheme = (schemeRaw || "").trim();

  return {
    present: true as const,
    scheme: scheme || "unknown",
    length: authorization.length,
  };
}

function getCookieInfo(req: any) {
  const cookie = getHeader(req, "cookie");
  if (!cookie) return { present: false as const };

  const hasConnectSid = /(?:^|;\s*)connect\.sid=/.test(cookie);

  return {
    present: true as const,
    length: cookie.length,
    hasConnectSid,
  };
}

export function buildAuthDebug(req: any) {
  const isAuthenticated =
    typeof req?.isAuthenticated === "function" ? req.isAuthenticated() : undefined;

  const forwardedProto = getHeader(req, "x-forwarded-proto");

  return {
    env: process.env.NODE_ENV,
    request: {
      method: req?.method,
      path: req?.path,
      originalUrl: req?.originalUrl,
      host: getHeader(req, "host"),
      origin: getHeader(req, "origin"),
      referer: getHeader(req, "referer"),
    },
    transport: {
      secure: req?.secure,
      protocol: req?.protocol,
      forwardedProto,
    },
    auth: {
      userPresent: !!req?.user,
      userIdPresent: !!req?.user?.id,
      userId: req?.user?.id,
      passportIsAuthenticated: isAuthenticated,
      sessionIdPresent: !!req?.sessionID,
      hasSessionObject: !!req?.session,
      sessionCookie: req?.session?.cookie
        ? {
            secure: req.session.cookie.secure,
            sameSite: req.session.cookie.sameSite,
            httpOnly: req.session.cookie.httpOnly,
          }
        : undefined,
      authorization: getAuthHeaderInfo(req),
      cookie: getCookieInfo(req),
    },
  };
}

