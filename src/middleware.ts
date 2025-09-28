import { auth } from "~/server/auth";

export default auth((req) => {
  if (!req.auth && req.nextUrl.pathname !== "/login") {
    const newUrl = new URL("/login", req.nextUrl.origin);
    return Response.redirect(newUrl);
    // } else if (req.auth) {
    //   if (
    //     !req.auth.user.profileComplete &&
    //     req.nextUrl.pathname !== "/complete-profile"
    //   ) {
    //     const newUrl = new URL("/complete-profile", req.nextUrl.origin);
    //     return Response.redirect(newUrl);
    //   }

    //   if (
    //     req.auth.user.profileComplete &&
    //     req.nextUrl.pathname === "/complete-profile"
    //   ) {
    //     const newUrl = new URL("/dashboard", req.nextUrl.origin);
    //     return Response.redirect(newUrl);
    //   }
  } else if (req.auth && req.nextUrl.pathname === "/login") {
    const newUrl = new URL("/dashboard", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
