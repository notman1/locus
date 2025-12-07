import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export const config = {
  api: { bodyParser: false },
};

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  let body = "";

  req.on("data", chunk => (body += chunk));
  req.on("end", async () => {
    const signature = req.headers["x-razorpay-signature"];

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest("hex");

    if (signature !== expected) {
      return res.status(400).send("Invalid signature");
    }

    const payload = JSON.parse(body);

    if (payload.event === "payment.captured") {
      const payment = payload.payload.payment.entity;

      await supabase
        .from("registrations")
        .update({
          status: "paid",
          txn_id: payment.id,
          payer_vpa: payment.vpa || null,
          gpay_payload: payment,
        })
        .eq("order_id", payment.order_id);
    }

    res.status(200).json({ ok: true });
  });
}
