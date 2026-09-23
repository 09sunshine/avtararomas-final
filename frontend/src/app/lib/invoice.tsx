import { pdf } from "@react-pdf/renderer";
import { fetchStoreSettings } from "./api";
import InvoicePDF from "../components/InvoicePDF";

// Define Order interface locally since it's not exported from Orders.tsx
interface Order {
  id: string;
  date: string;
  status: string;
  paymentMethod?: string | null;
  transactionId?: string | null;
  address: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  shipping?: number;
}

export async function generateInvoicePDF(order: Order): Promise<Blob> {
  try {
    console.log("Starting PDF generation for order:", order.id);

    // Use default store settings directly to avoid backend dependency
    const settings = {
      storeName: "AVTAR AROMAS",
      supportEmail: "avtar.aromas@gmail.com",
      phone: "+91 7976361500",
      gst: "08JJKPD1085C1ZB",
      address: "Premium Fragrances & Lifestyle",
    };

    // Calculate subtotal and shipping for the invoice
    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = order.shipping ?? 0;

    const orderWithTotals = {
      ...order,
      subtotal,
      shipping,
    };

    // Create PDF blob
    console.log("Generating PDF with @react-pdf/renderer...");
    const blob = await pdf(
      <InvoicePDF
        order={orderWithTotals}
        storeSettings={{
          storeName: settings.storeName,
          supportEmail: settings.supportEmail,
          phone: settings.phone,
          gst: settings.gst,
          address: "Premium Fragrances & Lifestyle",
        }}
      />
    ).toBlob();

    console.log("PDF generated successfully, blob size:", blob.size);
    return blob;
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to generate invoice PDF: ${errorMessage}`);
  }
}

export function downloadInvoice(blob: Blob, orderId: string, orderDate: string) {
  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  // Format filename: Invoice_AVT-001_23-Jul-2025.pdf
  const formattedDate = orderDate.replace(/,/g, "").replace(/\s+/g, "-");
  link.href = url;
  link.download = `Invoice_${orderId}_${formattedDate}.pdf`;

  // Trigger download
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function generateAndDownloadInvoice(order: Order) {
  try {
    const blob = await generateInvoicePDF(order);
    downloadInvoice(blob, order.id, order.date);
    return { success: true };
  } catch (error) {
    console.error("Error downloading invoice:", error);
    return { success: false, error };
  }
}