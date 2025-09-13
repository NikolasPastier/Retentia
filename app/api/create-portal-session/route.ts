import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe/config"
import { getUserProfile } from "@/lib/firebase/firestore"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 })
    }

    // Check if user has a paid plan
    const userProfile = await getUserProfile(userId)
    if (userProfile?.plan !== "paid") {
      return NextResponse.json({ error: "User does not have a paid plan" }, { status: 400 })
    }

    // Find the customer by email
    const customers = await stripe.customers.list({
      email: userProfile.email,
      limit: 1,
    })

    if (customers.data.length === 0) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    const customer = customers.data[0]

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Error creating portal session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
