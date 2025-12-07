import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { personal, competitions, totalAmount } = req.body;

  // Create a stable order reference
  const order_id = "ORDER_" + crypto.randomUUID();

  const { error } = await supabase
    .from("registrations")
    .insert({
      full_name: personal.fullName,
      email: personal.email,
      phone: personal.phone,
      institution: personal.institution,
      competitions,
      total_amount: totalAmount,
      order_id,
      status: "pending"
    });

  if (error) {
    console.error(error);
    return res.status(500).json({ ok: false });
  }

  res.status(200).json({ ok: true, orderId: order_id });
}