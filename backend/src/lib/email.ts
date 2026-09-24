import nodemailer from "nodemailer";
import dns from "node:dns";

// Prefer IPv4 over IPv6 to prevent ENETUNREACH in cloud container environments (e.g. Render)
try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  // Fallback for environments where not supported
}

// ─── Configuration ───────────────────────────────────────────────────────────

const smtpHost = (process.env.SMTP_HOST || "smtp-relay.brevo.com").trim();
const smtpPort = Number(process.env.SMTP_PORT || 2525);
const smtpEmail = (process.env.SMTP_EMAIL || "").trim();
const smtpPassword = (process.env.SMTP_APP_PASSWORD || "").trim();
const smtpFromEmail = (process.env.SMTP_FROM_EMAIL || smtpEmail).trim();
const adminEmail = (process.env.ADMIN_EMAIL || "").trim();
const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").trim();

const isConfigured = !!(smtpEmail && smtpPassword);

// ─── Transporter ──────────────────────────────────────────────────────────────

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!isConfigured) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpEmail,
        pass: smtpPassword,
      },
      // Force IPv4 to prevent ENETUNREACH errors on cloud hosting (e.g. Render)
      family: 4,
      connectionTimeout: 15000,
    } as any);
  }
  return transporter;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  items: Array<{ productName: string; quantity: number; price: number }>;
  address: {
    name: string;
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod?: string | null;
  trackingNumber?: string | null;
}

// ─── HTML Template ────────────────────────────────────────────────────────────

function formatPrice(p: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);
}

function buildEmailHtml(opts: {
  heading: string;
  preheader: string;
  statusColor: string;
  statusLabel: string;
  body: string;
  order: OrderEmailData;
  showItems?: boolean;
  footerNote?: string;
}): string {
  const { heading, preheader, statusColor, statusLabel, body, order, showItems = true, footerNote } = opts;

  const itemsHtml = showItems
    ? order.items
        .map(
          (item) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #1a1918;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#c4c0b8;">
            ${item.productName}
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #1a1918;font-family:'Courier New',monospace;font-size:13px;color:#999;text-align:center;">
            ×${item.quantity}
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #1a1918;font-family:'Courier New',monospace;font-size:14px;color:#e8e4dc;text-align:right;">
            ${formatPrice(item.price * item.quantity)}
          </td>
        </tr>`
        )
        .join("")
    : "";

  const addressLine = `${order.address.name}, ${order.address.line1}${order.address.line2 ? `, ${order.address.line2}` : ""}, ${order.address.city}, ${order.address.state} ${order.address.pincode}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${heading}</title>
  <!--[if !mso]><!-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital@1&display=swap');
  </style>
  <!--<![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#050504;font-family:'Helvetica Neue',Arial,sans-serif;">
  <!-- Preheader text (hidden) -->
  <div style="display:none;max-height:0;overflow:hidden;color:#050504;">${preheader}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#050504;">
    <tr>
      <td align="center" style="padding:20px 15px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#0a0908;border:1px solid rgba(201,169,110,0.12);">

          <!-- Header -->
          <tr>
            <td style="padding:32px 30px 24px;border-bottom:1px solid rgba(201,169,110,0.1);text-align:center;">
              <p style="margin:0;font-family:'Playfair Display','Georgia',serif;font-style:italic;font-size:24px;color:#C9A96E;letter-spacing:2px;">
                AVTAR AROMAS
              </p>
              <p style="margin:6px 0 0;font-family:'Courier New',monospace;font-size:10px;color:#666;letter-spacing:3px;text-transform:uppercase;">
                Luxury Fragrances
              </p>
            </td>
          </tr>

          <!-- Status Badge -->
          <tr>
            <td style="padding:24px 30px 0;text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" align="center">
                <tr>
                  <td style="padding:6px 20px;border:1px solid ${statusColor}40;background-color:${statusColor}10;font-family:'Courier New',monospace;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${statusColor};">
                    ${statusLabel}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Heading -->
          <tr>
            <td style="padding:20px 30px 8px;text-align:center;">
              <h1 style="margin:0;font-family:'Playfair Display','Georgia',serif;font-style:italic;font-size:22px;font-weight:300;color:#e8e4dc;">
                ${heading}
              </h1>
            </td>
          </tr>

          <!-- Body text -->
          <tr>
            <td style="padding:0 30px 24px;text-align:center;">
              <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#999;line-height:1.7;">
                ${body}
              </p>
            </td>
          </tr>

          <!-- Order Number -->
          <tr>
            <td style="padding:0 30px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid rgba(201,169,110,0.1);background-color:#050504;">
                <tr>
                  <td style="padding:14px 20px;">
                    <p style="margin:0;font-family:'Courier New',monospace;font-size:10px;color:#666;letter-spacing:2px;text-transform:uppercase;">Order Number</p>
                    <p style="margin:4px 0 0;font-family:'Courier New',monospace;font-size:15px;color:#C9A96E;">${order.orderNumber}</p>
                  </td>
                  <td style="padding:14px 20px;text-align:right;">
                    <p style="margin:0;font-family:'Courier New',monospace;font-size:10px;color:#666;letter-spacing:2px;text-transform:uppercase;">Total</p>
                    <p style="margin:4px 0 0;font-family:'Courier New',monospace;font-size:15px;color:#e8e4dc;">${formatPrice(order.total)}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${
            showItems
              ? `
          <!-- Items -->
          <tr>
            <td style="padding:20px 30px 0;">
              <p style="margin:0 0 12px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;color:#C9A96E;letter-spacing:3px;text-transform:uppercase;">Items Ordered</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${itemsHtml}
              </table>
            </td>
          </tr>
          `
              : ""
          }

          <!-- Shipping Address -->
          <tr>
            <td style="padding:20px 30px 0;">
              <p style="margin:0 0 8px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;color:#C9A96E;letter-spacing:3px;text-transform:uppercase;">Shipping Address</p>
              <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:#999;line-height:1.6;">
                ${addressLine}
              </p>
            </td>
          </tr>

          ${
            order.trackingNumber
              ? `
          <!-- Tracking -->
          <tr>
            <td style="padding:16px 30px 0;">
              <p style="margin:0 0 4px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;color:#C9A96E;letter-spacing:3px;text-transform:uppercase;">Tracking Number</p>
              <p style="margin:0;font-family:'Courier New',monospace;font-size:14px;color:#e8e4dc;">${order.trackingNumber}</p>
            </td>
          </tr>
          `
              : ""
          }

          <!-- CTA Button -->
          <tr>
            <td style="padding:28px 30px 0;text-align:center;">
              <a href="${frontendUrl}/account/orders" style="display:inline-block;padding:12px 32px;background-color:#C9A96E;color:#080807;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;font-weight:500;">
                View My Orders
              </a>
            </td>
          </tr>

          ${
            footerNote
              ? `
          <tr>
            <td style="padding:20px 30px 0;text-align:center;">
              <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:#666;line-height:1.6;font-style:italic;">
                ${footerNote}
              </p>
            </td>
          </tr>
          `
              : ""
          }

          <!-- Footer -->
          <tr>
            <td style="padding:28px 30px;border-top:1px solid rgba(201,169,110,0.08);margin-top:20px;">
              <p style="margin:0;text-align:center;font-family:'Courier New',monospace;font-size:10px;color:#444;letter-spacing:1px;">
                AVTAR AROMAS · Luxury Fragrances
              </p>
              <p style="margin:6px 0 0;text-align:center;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:#444;">
                This is an automated notification. Please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Admin Alert Template ─────────────────────────────────────────────────────

function buildAdminAlertHtml(opts: {
  heading: string;
  statusColor: string;
  statusLabel: string;
  body: string;
  order: OrderEmailData;
}): string {
  const { heading, statusColor, statusLabel, body, order } = opts;

  const itemsList = order.items.map((i) => `${i.productName} ×${i.quantity} — ${formatPrice(i.price * i.quantity)}`).join("<br/>");

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><title>${heading}</title></head>
<body style="margin:0;padding:0;background-color:#050504;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#050504;">
    <tr>
      <td align="center" style="padding:20px 15px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#0a0908;border:1px solid rgba(201,169,110,0.15);">
          <tr>
            <td style="padding:24px 28px;border-bottom:1px solid rgba(201,169,110,0.1);">
              <p style="margin:0;font-family:'Courier New',monospace;font-size:10px;color:#C9A96E;letter-spacing:3px;text-transform:uppercase;">Admin Alert — Avtar Aromas</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:5px 14px;border:1px solid ${statusColor}40;background-color:${statusColor}10;font-family:'Courier New',monospace;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:${statusColor};">
                    ${statusLabel}
                  </td>
                </tr>
              </table>
              <h2 style="margin:14px 0 8px;font-family:'Georgia',serif;font-size:18px;font-weight:normal;color:#e8e4dc;">${heading}</h2>
              <p style="margin:0 0 16px;font-size:13px;color:#999;line-height:1.6;">${body}</p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid rgba(201,169,110,0.1);background:#050504;">
                <tr>
                  <td style="padding:12px 16px;font-family:'Courier New',monospace;font-size:12px;color:#999;">
                    <strong style="color:#C9A96E;">Order:</strong> ${order.orderNumber}<br/>
                    <strong style="color:#C9A96E;">Customer:</strong> ${order.customerName} (${order.customerEmail})<br/>
                    <strong style="color:#C9A96E;">Total:</strong> ${formatPrice(order.total)}<br/>
                    <strong style="color:#C9A96E;">Payment:</strong> ${(order.paymentMethod || "online").toUpperCase()}<br/>
                    <strong style="color:#C9A96E;">Items:</strong><br/>${itemsList}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px;border-top:1px solid rgba(201,169,110,0.08);text-align:center;">
              <p style="margin:0;font-family:'Courier New',monospace;font-size:10px;color:#444;">Automated Admin Notification</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Send Helpers ──────────────────────────────────────────────────────────────

async function sendMail(to: string, subject: string, html: string): Promise<boolean> {
  const t = getTransporter();
  if (!t) {
    console.log(`[Email] Skipped (not configured): "${subject}" → ${to}`);
    return false;
  }

  try {
    await t.sendMail({
      from: `"Avtar Aromas" <${smtpFromEmail}>`,
      to,
      subject,
      html,
    });
    console.log(`[Email] Sent: "${subject}" → ${to}`);
    return true;
  } catch (err) {
    console.error(`[Email] Failed to send "${subject}" → ${to}:`, err);
    return false;
  }
}

function sendToAdmin(subject: string, html: string): Promise<boolean> {
  if (!adminEmail) {
    console.log(`[Email] No ADMIN_EMAIL configured, skipping admin notification.`);
    return Promise.resolve(false);
  }
  return sendMail(adminEmail, subject, html);
}

// ─── Public Notification Functions ────────────────────────────────────────────
// All functions are fire-and-forget: they never throw, so they won't block order flow.

export async function notifyNewOrder(order: OrderEmailData): Promise<void> {
  try {
    // Customer email
    const customerHtml = buildEmailHtml({
      heading: "Order Confirmed!",
      preheader: `Your order ${order.orderNumber} has been placed successfully.`,
      statusColor: "#22c55e",
      statusLabel: "Order Confirmed",
      body: `Thank you for your order, ${order.customerName}! We've received your order and will begin processing it shortly.`,
      order,
      showItems: true,
      footerNote: order.paymentMethod === "cod"
        ? "Payment will be collected at the time of delivery."
        : undefined,
    });
    await sendMail(order.customerEmail, `Order Confirmed — ${order.orderNumber} | Avtar Aromas`, customerHtml);

    // Admin email
    const adminHtml = buildAdminAlertHtml({
      heading: `New Order Received — ${order.orderNumber}`,
      statusColor: "#22c55e",
      statusLabel: "New Order",
      body: `A new order has been placed by ${order.customerName}.`,
      order,
    });
    await sendToAdmin(`🛒 New Order — ${order.orderNumber}`, adminHtml);
  } catch (err) {
    console.error("[Email] notifyNewOrder error:", err);
  }
}

export async function notifyPaymentSuccess(order: OrderEmailData): Promise<void> {
  try {
    const html = buildEmailHtml({
      heading: "Payment Successful",
      preheader: `Payment for order ${order.orderNumber} has been verified.`,
      statusColor: "#22c55e",
      statusLabel: "Payment Verified",
      body: `Great news, ${order.customerName}! Your payment has been successfully verified. Your order is now being processed.`,
      order,
      showItems: false,
    });
    await sendMail(order.customerEmail, `Payment Confirmed — ${order.orderNumber} | Avtar Aromas`, html);
  } catch (err) {
    console.error("[Email] notifyPaymentSuccess error:", err);
  }
}

export async function notifyPaymentFailed(order: OrderEmailData): Promise<void> {
  try {
    // Customer
    const customerHtml = buildEmailHtml({
      heading: "Payment Failed",
      preheader: `Payment for order ${order.orderNumber} could not be processed.`,
      statusColor: "#ef4444",
      statusLabel: "Payment Failed",
      body: `We're sorry, ${order.customerName}. Your payment could not be processed. You can retry your payment from the My Orders page.`,
      order,
      showItems: false,
      footerNote: "Click the button below to retry your payment.",
    });
    await sendMail(order.customerEmail, `Payment Failed — ${order.orderNumber} | Avtar Aromas`, customerHtml);

    // Admin
    const adminHtml = buildAdminAlertHtml({
      heading: `Payment Failed — ${order.orderNumber}`,
      statusColor: "#ef4444",
      statusLabel: "Payment Failed",
      body: `Payment failed for order by ${order.customerName}. The customer has been notified to retry.`,
      order,
    });
    await sendToAdmin(`⚠️ Payment Failed — ${order.orderNumber}`, adminHtml);
  } catch (err) {
    console.error("[Email] notifyPaymentFailed error:", err);
  }
}

export async function notifyStatusChange(order: OrderEmailData, newStatus: string): Promise<void> {
  try {
    const statusMap: Record<string, { heading: string; statusLabel: string; statusColor: string; body: string }> = {
      processing: {
        heading: "Order is Being Processed",
        statusLabel: "Processing",
        statusColor: "#f59e0b",
        body: `Your order ${order.orderNumber} is now being prepared for shipment.`,
      },
      shipped: {
        heading: "Your Order Has Been Shipped!",
        statusLabel: "Shipped",
        statusColor: "#C9A96E",
        body: `Exciting news, ${order.customerName}! Your order has been dispatched and is on its way to you.${order.trackingNumber ? ` Your tracking number is ${order.trackingNumber}.` : ""}`,
      },
      delivered: {
        heading: "Order Delivered!",
        statusLabel: "Delivered",
        statusColor: "#22c55e",
        body: `Your order has been delivered successfully! We hope you love your new fragrance. If you enjoy the product, we'd love to hear your thoughts — leave us a review!`,
      },
    };

    const cfg = statusMap[newStatus.toLowerCase()];
    if (!cfg) return;

    const html = buildEmailHtml({
      heading: cfg.heading,
      preheader: `Order ${order.orderNumber}: ${cfg.statusLabel}`,
      statusColor: cfg.statusColor,
      statusLabel: cfg.statusLabel,
      body: cfg.body,
      order,
      showItems: false,
    });
    await sendMail(order.customerEmail, `${cfg.statusLabel} — ${order.orderNumber} | Avtar Aromas`, html);
  } catch (err) {
    console.error("[Email] notifyStatusChange error:", err);
  }
}

export async function notifyCancellation(order: OrderEmailData, cancelledBy: "user" | "admin"): Promise<void> {
  try {
    // Customer email
    const customerHtml = buildEmailHtml({
      heading: "Order Cancelled",
      preheader: `Your order ${order.orderNumber} has been cancelled.`,
      statusColor: "#ef4444",
      statusLabel: "Cancelled",
      body: cancelledBy === "user"
        ? `Your order ${order.orderNumber} has been cancelled as per your request. If you paid online, a refund will be processed shortly.`
        : `Your order ${order.orderNumber} has been cancelled by our team. If you paid online, a refund will be processed shortly. We apologize for any inconvenience.`,
      order,
      showItems: false,
    });
    await sendMail(order.customerEmail, `Order Cancelled — ${order.orderNumber} | Avtar Aromas`, customerHtml);

    // Admin email (only when user cancels)
    if (cancelledBy === "user") {
      const adminHtml = buildAdminAlertHtml({
        heading: `Order Cancelled by Customer — ${order.orderNumber}`,
        statusColor: "#ef4444",
        statusLabel: "Cancelled by Customer",
        body: `${order.customerName} has cancelled their order.`,
        order,
      });
      await sendToAdmin(`❌ Order Cancelled — ${order.orderNumber}`, adminHtml);
    }
  } catch (err) {
    console.error("[Email] notifyCancellation error:", err);
  }
}

export async function notifyRefundUpdate(order: OrderEmailData, refundStatus: string): Promise<void> {
  try {
    const statusMap: Record<string, { heading: string; statusLabel: string; statusColor: string; body: string; adminAlert: boolean }> = {
      refund_initiated: {
        heading: "Refund Initiated",
        statusLabel: "Refund Initiated",
        statusColor: "#f59e0b",
        body: `A refund has been initiated for your order ${order.orderNumber}. The amount of ${formatPrice(order.total)} will be returned to your original payment method within 5-7 business days.`,
        adminAlert: true,
      },
      refund_processing: {
        heading: "Refund In Process",
        statusLabel: "Refund Processing",
        statusColor: "#3b82f6",
        body: `Your refund for order ${order.orderNumber} is being processed. You should see the amount reflected in your account shortly.`,
        adminAlert: false,
      },
      refunded: {
        heading: "Refund Completed!",
        statusLabel: "Refund Completed",
        statusColor: "#10b981",
        body: `Great news! The refund of ${formatPrice(order.total)} for order ${order.orderNumber} has been successfully processed and credited to your original payment method.`,
        adminAlert: false,
      },
      refund_failed: {
        heading: "Refund Failed",
        statusLabel: "Refund Failed",
        statusColor: "#ef4444",
        body: `We're sorry, but the refund for order ${order.orderNumber} could not be processed. Please contact our support team for assistance.`,
        adminAlert: true,
      },
    };

    const cfg = statusMap[refundStatus];
    if (!cfg) return;

    // Customer email
    const customerHtml = buildEmailHtml({
      heading: cfg.heading,
      preheader: `${cfg.statusLabel} for order ${order.orderNumber}`,
      statusColor: cfg.statusColor,
      statusLabel: cfg.statusLabel,
      body: cfg.body,
      order,
      showItems: false,
    });
    await sendMail(order.customerEmail, `${cfg.statusLabel} — ${order.orderNumber} | Avtar Aromas`, customerHtml);

    // Admin (only for initiated and failed)
    if (cfg.adminAlert) {
      const adminHtml = buildAdminAlertHtml({
        heading: `${cfg.statusLabel} — ${order.orderNumber}`,
        statusColor: cfg.statusColor,
        statusLabel: cfg.statusLabel,
        body: `Refund status update for order by ${order.customerName}: ${cfg.statusLabel}`,
        order,
      });
      await sendToAdmin(`💰 ${cfg.statusLabel} — ${order.orderNumber}`, adminHtml);
    }
  } catch (err) {
    console.error("[Email] notifyRefundUpdate error:", err);
  }
}

export interface ContactEmailData {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export async function notifyNewsletterSubscription(email: string): Promise<void> {
  try {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><title>Welcome to Avtar Aromas Inner Circle</title></head>
<body style="margin:0;padding:0;background-color:#050504;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#050504;">
    <tr>
      <td align="center" style="padding:20px 15px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#0a0908;border:1px solid rgba(201,169,110,0.12);">
          <tr>
            <td style="padding:32px 30px 24px;border-bottom:1px solid rgba(201,169,110,0.1);text-align:center;">
              <p style="margin:0;font-family:'Playfair Display','Georgia',serif;font-style:italic;font-size:24px;color:#C9A96E;letter-spacing:2px;">
                AVTAR AROMAS
              </p>
              <p style="margin:6px 0 0;font-family:'Courier New',monospace;font-size:10px;color:#666;letter-spacing:3px;text-transform:uppercase;">
                Luxury Fragrances
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 30px 0;text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" align="center">
                <tr>
                  <td style="padding:6px 20px;border:1px solid #C9A96E40;background-color:#C9A96E10;font-family:'Courier New',monospace;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#C9A96E;">
                    Welcome
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 30px 8px;text-align:center;">
              <h1 style="margin:0;font-family:'Playfair Display','Georgia',serif;font-style:italic;font-size:22px;font-weight:300;color:#e8e4dc;">
                You're in the Inner Circle
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 30px 24px;text-align:center;">
              <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#999;line-height:1.7;">
                Welcome to Avtar Aromas. You are now part of an exclusive community that receives rare drops, private event invitations, and olfactory stories before anyone else.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 30px 24px;text-align:center;">
              <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:#666;line-height:1.7;font-style:italic;">
                "Fragrance is memory made tangible. We look forward to sharing our world with you."
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 30px;border-top:1px solid rgba(201,169,110,0.08);">
              <p style="margin:0;text-align:center;font-family:'Courier New',monospace;font-size:10px;color:#444;letter-spacing:1px;">
                AVTAR AROMAS · Luxury Fragrances
              </p>
              <p style="margin:6px 0 0;text-align:center;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:#444;">
                You received this because you subscribed to our newsletter. If you wish to unsubscribe, you can do so at any time.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    await sendMail(email, "Welcome to the Inner Circle — Avtar Aromas", html);
  } catch (err) {
    console.error("[Email] notifyNewsletterSubscription error:", err);
  }
}

export async function notifyContactMessage(data: ContactEmailData): Promise<void> {
  try {
    const { name, email, phone, subject, message } = data;
    const inquirySubject = subject ? subject.trim() : "General Inquiry";

    // 1. Admin Email
    const adminHtml = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><title>New Contact Form Submission</title></head>
<body style="margin:0;padding:0;background-color:#050504;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#050504;">
    <tr>
      <td align="center" style="padding:20px 15px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;background-color:#0a0908;border:1px solid rgba(201,169,110,0.2);">
          <tr>
            <td style="padding:28px 30px;border-bottom:1px solid rgba(201,169,110,0.12);text-align:center;">
              <p style="margin:0;font-family:'Georgia',serif;font-style:italic;font-size:22px;color:#C9A96E;letter-spacing:2px;">AVTAR AROMAS</p>
              <p style="margin:4px 0 0;font-family:'Courier New',monospace;font-size:10px;color:#666;letter-spacing:3px;text-transform:uppercase;">Contact Form Inquiry</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 30px;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                <tr>
                  <td style="padding:5px 14px;border:1px solid #C9A96E40;background-color:#C9A96E10;font-family:'Courier New',monospace;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#C9A96E;">
                    New Inquiry Received
                  </td>
                </tr>
              </table>
              <h2 style="margin:0 0 16px;font-family:'Georgia',serif;font-size:18px;font-weight:300;color:#e8e4dc;">
                Message from ${name}
              </h2>
              
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid rgba(201,169,110,0.12);background:#050504;margin-bottom:20px;">
                <tr>
                  <td style="padding:16px 20px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:#c4c0b8;line-height:1.8;">
                    <strong style="color:#C9A96E;">Sender Name:</strong> ${name}<br/>
                    <strong style="color:#C9A96E;">Email Address:</strong> <a href="mailto:${email}" style="color:#e8e4dc;">${email}</a><br/>
                    <strong style="color:#C9A96E;">Mobile / Phone:</strong> ${phone || "Not provided"}<br/>
                    <strong style="color:#C9A96E;">Subject:</strong> ${inquirySubject}
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-family:'Courier New',monospace;font-size:10px;color:#C9A96E;letter-spacing:2px;text-transform:uppercase;">Message Body:</p>
              <div style="padding:16px 20px;background:#121110;border-left:3px solid #C9A96E;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#e8e4dc;line-height:1.7;white-space:pre-wrap;">${message}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 30px;border-top:1px solid rgba(201,169,110,0.08);text-align:center;">
              <p style="margin:0;font-family:'Courier New',monospace;font-size:10px;color:#555;">Avtar Aromas Concierge System</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    await sendToAdmin(`📩 Contact Inquiry from ${name}: ${inquirySubject}`, adminHtml);

    // 2. User Receipt Email
    const customerHtml = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><title>Thank You for Contacting Avtar Aromas</title></head>
<body style="margin:0;padding:0;background-color:#050504;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#050504;">
    <tr>
      <td align="center" style="padding:20px 15px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;background-color:#0a0908;border:1px solid rgba(201,169,110,0.2);">
          <tr>
            <td style="padding:28px 30px;border-bottom:1px solid rgba(201,169,110,0.12);text-align:center;">
              <p style="margin:0;font-family:'Georgia',serif;font-style:italic;font-size:22px;color:#C9A96E;letter-spacing:2px;">AVTAR AROMAS</p>
              <p style="margin:4px 0 0;font-family:'Courier New',monospace;font-size:10px;color:#666;letter-spacing:3px;text-transform:uppercase;">Luxury Fragrances</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 30px;text-align:center;">
              <h1 style="margin:0 0 16px;font-family:'Georgia',serif;font-style:italic;font-size:22px;font-weight:300;color:#e8e4dc;">
                We Have Received Your Message
              </h1>
              <p style="margin:0 0 20px;font-size:14px;color:#999;line-height:1.8;">
                Dear ${name},<br/><br/>
                Thank you for reaching out to Avtar Aromas. Our concierge team has received your inquiry regarding <em>"${inquirySubject}"</em> and will get back to you within 24 hours.
              </p>
              <p style="margin:0;font-size:13px;color:#666;font-style:italic;">
                If your matter is urgent, feel free to contact us directly at concierge@avtararomas.com or +91 98765 43210.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 30px;border-top:1px solid rgba(201,169,110,0.08);text-align:center;">
              <p style="margin:0;font-family:'Courier New',monospace;font-size:10px;color:#444;">AVTAR AROMAS · Kannauj Atelier</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    await sendMail(email, `Thank you for contacting Avtar Aromas`, customerHtml);
  } catch (err) {
    console.error("[Email] notifyContactMessage error:", err);
  }
}

