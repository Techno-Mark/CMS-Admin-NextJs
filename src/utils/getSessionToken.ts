import { authOptions } from "@/libs/auth"
import { defaultRedirectRoute } from "@/services/app.config"
import { getServerSession } from "next-auth"

// Function to get session token from cookies manually
const getSessionToken = async () => {
  const session = await getServerSession(authOptions)

  if (!session) {

    //   res.status(401).json({ message: "You must be logged in." })

  } else {
    window.location.href = defaultRedirectRoute
  }
}

export default getSessionToken
