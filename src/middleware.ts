import { NextRequestWithAuth, withAuth } from "next-auth/middleware";
import { ensurePrefix, withoutSuffix } from "./utils/string";
import { NextFetchEvent, NextResponse } from "next/server";
import { getSession } from "next-auth/react";

const HOME_PAGE_URL = "/";

const localizedRedirect = (url: string, request: NextRequestWithAuth) => {
  let _url = url;

  const isLocaleMissing = _url;

  if (isLocaleMissing) {
    _url = _url;
  }

  let _basePath = process.env.BASEPATH ?? "";

  _basePath = _basePath.replace(
    "demo-1",
    request.headers.get("X-server-header") ?? "demo-1"
  );

  _url = ensurePrefix(_url, `${_basePath ?? ""}`);

  const redirectUrl = new URL(_url, request.url).toString();

  return NextResponse.redirect(redirectUrl);
};

export default withAuth(
  async function middleware(request: any, event: NextFetchEvent) {
    const pathname = request.nextUrl.pathname;
    // const token = request.nextauth.token;
    // Get the token from the request using next-auth's getToken method
    // const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    console.log("pathname", pathname);

    const requestForNextAuth = {
      headers: {
        cookie: request.headers.get("cookie"),
      },
    };

    const token = await getSession({ req: requestForNextAuth });
    console.log("Middleware token", token);
    // Check if the user is logged in

    const isUserLoggedIn = !!token;

    // Guest routes (Routes that can be accessed by guest users who are not logged in)
    const guestRoutes = ["login", "forgot-password"];

    // Private routes (All routes except guest and shared routes that can only be accessed by logged in users)
    const privateRoute = ![...guestRoutes].some((route) =>
      pathname.endsWith(route)
    );

    // If the user is not logged in and is trying to access a private route, redirect to the login page
    if (!isUserLoggedIn && privateRoute) {
      let redirectUrl = "/login";

      // if (!(pathname === "/")) {
      //   const searchParamsStr = new URLSearchParams({
      //     redirectTo: withoutSuffix(pathname, "/"),
      //   }).toString();
      //   console.log(redirectUrl,"redirectUrlredirectUrl");

      //   redirectUrl += `?${searchParamsStr}`;
      // }
      console.log("---------------1");

      return localizedRedirect(redirectUrl, request);
    }
    // If the user is logged in and is trying to access a guest route, redirect to the root page

    const isRequestedRouteIsGuestRoute = guestRoutes.some((route) =>
      pathname.endsWith(route)
    );

    if (isUserLoggedIn &&  (isRequestedRouteIsGuestRoute || pathname === "/")) {
      console.log("---------------2");
      return localizedRedirect(HOME_PAGE_URL, request);
    }

    // If the user is logged in and is trying to access root page, redirect to the home page
    if (pathname === "/") {
      console.log("---------------3");
      return localizedRedirect(HOME_PAGE_URL, request);
    }
    console.log("---------------4", pathname);
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        console.log("Middleware token", token);
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.+?/hook-examples|.+?/menu-examples|images|next.svg|vercel.svg).*)",
  ],
  // matcher: ["/home"]
};
