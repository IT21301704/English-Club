export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/portal/:path*', '/admin/:path*', '/invoice/:path*'],
};
