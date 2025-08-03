
import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { trpc } from '@/utils/trpc';
import { Plus, ShoppingCart, Trash2, Package, DollarSign, User, Calendar } from 'lucide-react';
import type { Sale, NonMedicalProduct, CreateSaleInput } from '../../../server/src/schema';

interface SaleItemForm {
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export function SalesManagement() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<NonMedicalProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm]= useState(false);

  const [formData, setFormData] = useState<Omit<CreateSaleInput, 'items'>>({
    sale_number: '',
    customer_name: null,
    total_amount: 0,
    amount_paid: 0,
    change_amount: 0,
    payment_method: 'cash',
  });

  const [saleItems, setSaleItems] = useState<SaleItemForm[]>([]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [salesData, productsData] = await Promise.all([
        trpc.getSales.query(),
        trpc.getNonMedicalProducts.query(),
      ]);
      setSales(salesData);
      setProducts(productsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const generateSaleNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 4).toUpperCase();
    return `S${timestamp}${random}`;
  };

  const addSaleItem = () => {
    setSaleItems((prev: SaleItemForm[]) => [
      ...prev,
      { product_id: 0, quantity: 1, unit_price: 0, total_price: 0 }
    ]);
  };

  const removeSaleItem = (index: number) => {
    setSaleItems((prev: SaleItemForm[]) => prev.filter((_, i) => i !== index));
    calculateTotals();
  };

  const updateSaleItem = (index: number, field: keyof SaleItemForm, value: string) => {
    setSaleItems((prev: SaleItemForm[]) => {
      const newItems = [...prev];
      const numValue = parseFloat(value) || 0;
      
      if (field === 'product_id') {
        const product = products.find((p: NonMedicalProduct) => p.id === parseInt(value));
        if (product) {
          newItems[index] = {
            ...newItems[index],
            product_id: parseInt(value),
            unit_price: product.unit_price,
            total_price: product.unit_price * newItems[index].quantity
          };
        }
      } else if (field === 'quantity') {
        newItems[index] = {
          ...newItems[index],
          quantity: numValue,
          total_price: newItems[index].unit_price * numValue
        };
      } else {
        newItems[index] = { ...newItems[index], [field]: numValue };
      }
      
      return newItems;
    });
    
    // Calculate totals after a short delay to ensure state is updated
    setTimeout(calculateTotals, 0);
  };

  const calculateTotals = () => {
    const total = saleItems.reduce((sum, item) => sum + item.total_price, 0);
    setFormData((prev) => ({
      ...prev,
      total_amount: total,
      change_amount: Math.max(0, prev.amount_paid - total)
    }));
  };

  const handleAmountPaidChange = (value: string) => {
    const amountPaid = parseFloat(value) || 0;
    setFormData((prev) => ({
      ...prev,
      amount_paid: amountPaid,
      change_amount: Math.max(0, amountPaid - prev.total_amount)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saleItems.length === 0) {
      alert('Please add at least one item to the sale.');
      return;
    }

    setLoading(true);
    try {
      const saleData: CreateSaleInput = {
        ...formData,
        items: saleItems
      };
      
      const newSale = await trpc.createSale.mutate(saleData);
      setSales((prev: Sale[]) => [newSale, ...prev]);
      
      // Reset form
      setFormData({
        sale_number: '',
        customer_name: null,
        total_amount: 0,
        amount_paid: 0,
        change_amount: 0,
        payment_method: 'cash',
      });
      setSaleItems([]);
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create sale:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <ShoppingCart className="h-8 w-8 text-indigo-600" />
            Sales Management
          </h2>
          <p className="text-gray-600 mt-1">Manage product sales and transactions 🛒</p>
        </div>
        <Button 
          onClick={() => {
            setFormData(prev => ({ ...prev, sale_number: generateSaleNumber() }));
            setShowForm(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Sale
        </Button>
      </div>

      {/* New Sale Form */}
      {showForm && (
        <Card className="bg-white/90 backdrop-blur-sm border-indigo-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">New Sale Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Sale Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="sale_number">Sale Number *</Label>
                  <Input
                    id="sale_number"
                    value={formData.sale_number}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData(prev => ({ ...prev, sale_number: e.target.value }))
                    }
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="customer_name">Customer Name</Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData(prev => ({ ...prev, customer_name: e.target.value || null }))
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="payment_method">Payment Method *</Label>
                  <Select 
                    value={formData.payment_method} 
                    onValueChange={(value) => 
                      setFormData(prev => ({ 
                        ...prev, 
                        payment_method: value as 'cash' | 'card' | 'insurance' | 'mobile_money'
                      }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Sale Items */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-700">Sale Items</h3>
                  <Button 
                    type="button" 
                    onClick={addSaleItem}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </div>

                {saleItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="col-span-4">
                      <Label>Product</Label>
                      <Select 
                        value={item.product_id > 0 ? item.product_id.toString() : 'none'} 
                        onValueChange={(value) => updateSaleItem(index, 'product_id', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Select a product</SelectItem>
                          {products.length > 0 ? products.map((product: NonMedicalProduct) => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              {product.name} (${product.unit_price.toFixed(2)})
                            </SelectItem>
                          )) : (
                            <SelectItem value="no-products" disabled>No products available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          updateSaleItem(index, 'quantity', e.target.value)
                        }
                        min="1"
                      />
                    </div>

                    <div className="col-span-2">
                      <Label>Unit Price</Label>
                      <Input
                        type="number"
                        value={item.unit_price}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          updateSaleItem(index, 'unit_price', e.target.value)
                        }
                        step="0.01"
                        min="0"
                      />
                    </div>

                    <div className="col-span-3">
                      <Label>Total</Label>
                      <Input
                        type="number"
                        value={item.total_price.toFixed(2)}
                        readOnly
                        className="bg-gray-100"
                      />
                    </div>

                    <div className="col-span-1">
                      <Button
                        type="button"
                        onClick={() => removeSaleItem(index)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {saleItems.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No items added yet. Click "Add Item" to start.
                  </div>
                )}
              </div>

              <Separator />

              {/* Payment Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="total_amount">Total Amount</Label>
                  <Input
                    id="total_amount"
                    type="number"
                    value={formData.total_amount.toFixed(2)}
                    readOnly
                    className="mt-1 bg-gray-100 font-semibold"
                  />
                </div>

                <div>
                  <Label htmlFor="amount_paid">Amount Paid *</Label>
                  <Input
                    id="amount_paid"
                    type="number"
                    value={formData.amount_paid}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleAmountPaidChange(e.target.value)
                    }
                    step="0.01"
                    min="0"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="change_amount">Change</Label>
                  <Input
                    id="change_amount"
                    type="number"
                    value={formData.change_amount.toFixed(2)}
                    readOnly
                    className="mt-1 bg-gray-100"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
                  {loading ? 'Processing...' : 'Complete Sale'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowForm(false);
                    setSaleItems([]);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Products Quick Add */}
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
            <Package className="h-5 w-5 text-indigo-600" />
            Available Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No products available. Add some products first to make sales.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product: NonMedicalProduct) => (
                <div key={product.id} className="p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-medium text-gray-800">{product.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    ${product.unit_price.toFixed(2)} • Stock: {product.stock_quantity}
                  </p>
                  {product.description && (
                    <p className="text-xs text-gray-500 mt-1">
                      {product.description.substring(0, 60)}...
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sales History */}
      <div className="grid gap-6">
        {loading && sales.length === 0 ? (
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="bg-white/80 animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : sales.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
            <CardContent className="p-12 text-center">
              <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Sales Yet</h3>
              <p className="text-gray-500 mb-6">Start by making your first sale transaction.</p>
              <Button 
                onClick={() => {
                  setFormData(prev => ({ ...prev, sale_number: generateSaleNumber() }));
                  setShowForm(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Make First Sale
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Sales History</h3>
            {sales.map((sale: Sale) => (
              <Card key={sale.id} className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg hover:shadow-xl transition-shadow mb-4">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-100 rounded-full">
                        <ShoppingCart className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">
                          Sale #{sale.sale_number}
                        </h3>
                        {sale.customer_name && (
                          <p className="text-gray-600 flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {sale.customer_name}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      <DollarSign className="h-3 w-3 mr-1" />
                      ${sale.total_amount.toFixed(2)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-700 text-sm mb-1">Payment Method</h4>
                      <p className="text-sm text-gray-600 capitalize">
                        {sale.payment_method.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 text-sm mb-1">Amount Paid</h4>
                      <p className="text-sm text-gray-600">
                        ${sale.amount_paid.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 text-sm mb-1">Change</h4>
                      <p className="text-sm text-gray-600">
                        ${sale.change_amount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 text-sm mb-1">Sale Date</h4>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {sale.sale_date.toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                    Created: {sale.created_at.toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
