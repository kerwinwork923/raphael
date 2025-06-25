import { defineStore } from 'pinia'

export const useCheckoutStore = defineStore('checkout', {
  state: () => ({
    /**
     * The AID of the selected recipient address.
     * @type {string | null}
     */
    selectedAddressId: null,

    /**
     * The InvoiceID of the selected invoice.
     * @type {string | null}
     */
    selectedInvoiceId: null,
  }),
  actions: {
    /**
     * Sets the selected address ID.
     * @param {string} addressId The AID of the address.
     */
    setSelectedAddress(addressId) {
      this.selectedAddressId = addressId
    },

    /**
     * Sets the selected invoice ID.
     * @param {string} invoiceId The InvoiceID of the invoice.
     */
    setSelectedInvoice(invoiceId) {
      this.selectedInvoiceId = invoiceId
    },
  },
  persist: true,
}) 