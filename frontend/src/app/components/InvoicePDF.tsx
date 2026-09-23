import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Define Order interface locally
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
    quantity?: number;
    qty?: number;
  }>;
  total: number;
  shipping?: number;
  subtotal?: number;
}

interface InvoicePDFProps {
  order: Order;
  storeSettings?: {
    storeName: string;
    supportEmail: string;
    phone: string;
    gst: string;
    address?: string;
  };
}

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
    color: "#1a1a1a",
  },
  header: {
    marginBottom: 32,
    borderBottom: "2 solid #C9A96E",
    paddingBottom: 20,
  },
  brandName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  contactInfo: {
    fontSize: 10,
    color: "#666666",
    lineHeight: 1.5,
  },
  invoiceTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#C9A96E",
    marginTop: 16,
    marginBottom: 4,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 9,
    color: "#888888",
    marginBottom: 2,
  },
  value: {
    fontSize: 10,
    color: "#1a1a1a",
    marginBottom: 8,
  },
  table: {
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F8F4ED",
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottom: "1 solid #EEEEEE",
  },
  colItem: { flex: 3 },
  colQty: { flex: 1, textAlign: "center" },
  colPrice: { flex: 1.5, textAlign: "right" },
  colTotal: { flex: 1.5, textAlign: "right" },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#666666",
    textTransform: "uppercase",
  },
  tableCell: {
    fontSize: 10,
    color: "#1a1a1a",
  },
  totals: {
    marginTop: 16,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 6,
    gap: 12,
  },
  totalLabel: {
    fontSize: 10,
    color: "#666666",
  },
  totalValue: {
    fontSize: 10,
    color: "#1a1a1a",
    fontWeight: "bold",
    minWidth: 80,
    textAlign: "right",
  },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
    paddingTop: 8,
    borderTop: "2 solid #C9A96E",
    gap: 12,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#C9A96E",
    minWidth: 100,
    textAlign: "right",
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTop: "1 solid #DDDDDD",
    fontSize: 9,
    color: "#666666",
    lineHeight: 1.6,
  },
});

export default function InvoicePDF({ order, storeSettings }: InvoicePDFProps) {
  const settings = {
    storeName: storeSettings?.storeName || "AVTAR AROMAS",
    supportEmail: storeSettings?.supportEmail || "avtar.aromas@gmail.com",
    phone: storeSettings?.phone || "+91 7976361500",
    gst: storeSettings?.gst || "08JJKPD1085C1ZB",
    address: storeSettings?.address || "Premium Fragrances & Lifestyle",
  };

  const subtotal = order.subtotal || order.items.reduce((sum, item) => sum + item.price * (item.quantity || item.qty || 0), 0);
  const shipping = order.shipping ?? 0;
  const discount = Math.max(0, subtotal - order.total + shipping);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brandName}>{settings.storeName}</Text>
          <Text style={styles.contactInfo}>
            {settings.address}
            {"\n"}
            Email: {settings.supportEmail}
            {"\n"}
            Phone: {settings.phone}
            {"\n"}
            GST: {settings.gst}
          </Text>
          <Text style={styles.invoiceTitle}>INVOICE</Text>
        </View>

        <View style={styles.section}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View>
              <Text style={styles.label}>ORDER NUMBER</Text>
              <Text style={styles.value}>{order.id}</Text>
              <Text style={styles.label}>ORDER DATE</Text>
              <Text style={styles.value}>{order.date}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.label}>STATUS</Text>
              <Text style={styles.value}>{order.status}</Text>
              <Text style={styles.label}>PAYMENT METHOD</Text>
              <Text style={styles.value}>{(order.paymentMethod || "Online").toUpperCase()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>BILL TO</Text>
          <Text style={styles.value}>{order.address}</Text>
          {order.transactionId && (
            <>
              <Text style={styles.label}>TRANSACTION ID</Text>
              <Text style={styles.value}>{order.transactionId}</Text>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>ITEMS</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.colItem]}>ITEM</Text>
              <Text style={[styles.tableHeaderText, styles.colQty]}>QTY</Text>
              <Text style={[styles.tableHeaderText, styles.colPrice]}>PRICE</Text>
              <Text style={[styles.tableHeaderText, styles.colTotal]}>TOTAL</Text>
            </View>

            {order.items.map((item, index) => {
              const qty = item.quantity || item.qty || 0;
              return (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.colItem]}>{item.name}</Text>
                  <Text style={[styles.tableCell, styles.colQty]}>{qty}</Text>
                  <Text style={[styles.tableCell, styles.colPrice]}>₹{item.price.toLocaleString("en-IN")}</Text>
                  <Text style={[styles.tableCell, styles.colTotal]}>₹{(item.price * qty).toLocaleString("en-IN")}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>₹{subtotal.toLocaleString("en-IN")}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Shipping:</Text>
            <Text style={styles.totalValue}>₹{shipping.toLocaleString("en-IN")}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount:</Text>
              <Text style={[styles.totalValue, { color: "#22c55e" }]}>-₹{discount.toLocaleString("en-IN")}</Text>
            </View>
          )}
          <View style={styles.grandTotal}>
            <Text style={styles.grandTotalLabel}>Grand Total:</Text>
            <Text style={styles.grandTotalValue}>₹{order.total.toLocaleString("en-IN")}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={{ fontSize: 11, fontWeight: "bold", color: "#C9A96E", marginBottom: 8 }}>
            Thank you for shopping with {settings.storeName}!
          </Text>
          <Text>
            For any queries, contact us at {settings.supportEmail} or call {settings.phone}
            {"\n"}
            Follow us: @avtar_aromas (Instagram)
          </Text>
        </View>
      </Page>
    </Document>
  );
}