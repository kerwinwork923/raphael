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

    /**
     * Selected cart items for checkout.
     * @type {Array}
     */
    selectedCartItems: [],

    /**
     * Total amount of selected items.
     * @type {number}
     */
    selectedTotalAmount: 0,
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

    /**
     * Sets the selected cart items for checkout.
     * @param {Array} items The selected cart items.
     */
    setSelectedCartItems(items) {
      this.selectedCartItems = items
    },

    /**
     * Sets the total amount of selected items.
     * @param {number} amount The total amount.
     */
    setSelectedTotalAmount(amount) {
      this.selectedTotalAmount = amount
    },

    /**
     * Clears all checkout data.
     */
    clearCheckoutData() {
      this.selectedAddressId = null
      this.selectedInvoiceId = null
      this.selectedCartItems = []
      this.selectedTotalAmount = 0
    },
  },
  persist: true,
}) 