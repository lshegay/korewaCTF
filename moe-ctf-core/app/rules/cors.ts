import { useRule } from '../utils/pogo-resolver/mod.ts';

export type CorsOptions = {
  origin: string[] | string;
  credentials: boolean;
  methods: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  optionsSuccessStatus: number;
  maxAge?: number;
};

const DEFAULT_OPTIONS: CorsOptions = {
  origin: '*',
  credentials: false,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  optionsSuccessStatus: 204,
};

/**
 * Addes cors feature
 */
export const cors = useRule<Partial<CorsOptions>>({
  resolve: ({ req, options: _options }) => {
    const options = {
      ...DEFAULT_OPTIONS,
      ..._options,
    };

    const requestOrigin = req.headers.get('origin');
    if (!requestOrigin) {
      req.response.status = 404;
      return req.response;
    }

    if (options.origin == '*') {
      req.response.headers.append('Access-Control-Allow-Origin', '*');
    } else if (
      (Array.isArray(options.origin) && options.origin.includes(requestOrigin)) ||
      (typeof options.origin == 'string' && options.origin == requestOrigin)
    ) {
      req.response.headers.append('Access-Control-Allow-Origin', requestOrigin);
      req.response.headers.append('Vary', 'Origin');
    }

    if (options.methods.length > 0) {
      req.response.headers.append(
        'Access-Control-Allow-Methods',
        options.methods.join(','),
      );
    }

    if (options.credentials) {
      req.response.headers.append(
        'Access-Control-Allow-Credentials',
        'true',
      );
    }

    if (options.exposedHeaders?.length) {
      req.response.headers.append(
        'Access-Control-Expose-Headers',
        options.exposedHeaders.join(','),
      );
    }

    if (req.method == 'OPTIONS') {
      if (options.maxAge) {
        req.response.headers.append(
          'Access-Control-Max-Age',
          options.maxAge.toString(),
        );
      }

      const requestHeaders = req.headers.get('access-control-request-headers');

      if (options.allowedHeaders?.length) {
        req.response.headers.append(
          'Access-Control-Allow-Headers',
          options.allowedHeaders.join(','),
        );
      } else if (requestHeaders) {
        req.response.headers.append(
          'Access-Control-Allow-Headers',
          requestHeaders,
        );
        req.response.headers.append('Vary', 'Access-Control-Request-Headers');
      }

      req.response.headers.append('Content-Length', '0');
      req.response.status = 204;

      return req.response;
    }
  },
});
