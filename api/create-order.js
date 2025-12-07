import Razorpay from "razorpay";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { personal, competitions, amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  const razor = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  try {
    // 1️⃣ Create Razorpay order
    const order = await razor.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`
    });

    // 2️⃣ Insert registration immediately (PENDING)
    const { error } = await supabase
      .from("registrations")
      .insert({
        full_name: personal.fullName,
        email: personal.email,
        phone: personal.phone,
        institution: personal.institution,
        competitions,
        total_amount: amount,
        currency: "INR",
        order_id: order.id,
        status: "pending"
      });

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ error: "DB insert failed" });
    }

    // 3️⃣ Return order to frontend
    res.json({
      orderId: order.id,
      amount: order.amount,
      key: process.env.RAZORPAY_KEY_ID
    });

  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ error: "Failed to create payment order" });
  }
}
