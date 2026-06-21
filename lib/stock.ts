export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'priced_on_request'

export function getStockStatus(
  totalQuantity: number,
  retailPrice: number,
  reorderLevel = 10
): StockStatus {
  if (retailPrice <= 0) return 'priced_on_request'
  if (totalQuantity <= 0) return 'out_of_stock'
  if (totalQuantity <= reorderLevel) return 'low_stock'
  return 'in_stock'
}

export function getStockLabel(status: StockStatus, totalQuantity?: number) {
  switch (status) {
    case 'in_stock':
      return 'In stock'
    case 'low_stock':
      return totalQuantity != null ? `Low stock (${totalQuantity} left)` : 'Low stock'
    case 'out_of_stock':
      return 'Out of stock'
    case 'priced_on_request':
      return 'Price on request'
  }
}

export function getStockStatusClass(status: StockStatus) {
  switch (status) {
    case 'in_stock':
      return 'status-success'
    case 'low_stock':
      return 'status-warning'
    case 'out_of_stock':
      return 'status-destructive'
    case 'priced_on_request':
      return 'status-info'
  }
}