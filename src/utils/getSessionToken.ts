import { authOptions } from "@/libs/auth";
import { verify } from "jsonwebtoken";
import { NextApiRequest } from "next";
import { getServerSession } from "next-auth";

// Function to get session token from cookies manually
const getSessionToken = async () => {
  const session = await getServerSession(authOptions);
 
  if (!session) {


    //   res.status(401).json({ message: "You must be logged in." })
    return;
  } else {
    window.location.href = "/home";
  }
};

export default getSessionToken;
