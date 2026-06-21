export function getOrderStatusClass(status: string) {
  switch (status) {
    case 'pending':
      return 'status-warning'
    case 'processing':
      return 'status-info'
    case 'shipped':
      return 'status-info'
    case 'delivered':
      return 'status-success'
    case 'cancelled':
      return 'status-destructive'
    default:
      return 'status-muted'
  }
}

export function getPaymentStatusClass(status: string) {
  switch (status) {
    case 'completed':
      return 'status-success'
    case 'processing':
      return 'status-warning'
    case 'failed':
      return 'status-destructive'
    case 'refunded':
      return 'status-muted'
    default:
      return 'status-warning'
  }
}

export function getQuotationStatusClass(status: string) {
  switch (status) {
    case 'draft':
      return 'status-muted'
    case 'sent':
      return 'status-info'
    case 'accepted':
      return 'status-success'
    case 'rejected':
      return 'status-destructive'
    case 'expired':
      return 'status-warning'
    default:
      return 'status-muted'
  }
}

/** @deprecated Use getOrderStatusClass with StatusBadge component */
export function getOrderStatusColor(status: string) {
  return `status-pill ${getOrderStatusClass(status)}`
}

/** @deprecated Use getQuotationStatusClass with StatusBadge component */
export function getQuotationStatusColor(status: string) {
  return `status-pill ${getQuotationStatusClass(status)}`
}