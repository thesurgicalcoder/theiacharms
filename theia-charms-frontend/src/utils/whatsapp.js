// Zero cart / zero checkout: every purchase intent goes through a WhatsApp chat.
const clean = (phone) => String(phone || '').replace(/\D/g, '');

export function productEnquiryUrl(product, phone) {
  const text = product.isSoldOut
    ? `Hello THEIA CHARMS, I noticed Product ${product.productId} (${product.name}) is currently sold out. Could you please notify me when it is back in stock?`
    : `Hello THEIA CHARMS, I am interested in Product ${product.productId} (${product.name}) priced at ₹${product.price}. Is it available?`;
  return `https://wa.me/${clean(phone)}?text=${encodeURIComponent(text)}`;
}
export const generalEnquiryUrl = (phone) =>
  `https://wa.me/${clean(phone)}?text=${encodeURIComponent('Hello THEIA CHARMS, I would like to know more about your collection.')}`;
