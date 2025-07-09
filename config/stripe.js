import Stripe from "stripe"

const stripe = Stripe(process.env.STRIPE_KEY)

export default stripe