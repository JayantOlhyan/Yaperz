'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import styles from './page.module.css';

export default function CheckoutPage() {
  const { cartItems, cartSubtotal, clearCart } = useCart();

  // Success State
  const [isOrdered, setIsOrdered] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');

  // Form States
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express' | 'hand'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');

  // Error States
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculations
  const shippingCost =
    shippingMethod === 'hand'
      ? 6000
      : shippingMethod === 'express'
      ? 350
      : cartSubtotal >= 5000
      ? 0
      : 150;

  const taxAmount = Math.round(cartSubtotal * 0.12); // Simulated 12% GST
  const grandTotal = cartSubtotal + shippingCost;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    const newErrors: Record<string, string> = {};
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Enter a valid email address';
    if (!phone.match(/^\d{10}$/)) newErrors.phone = 'Enter a valid 10-digit mobile number';
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!address.trim()) newErrors.address = 'Shipping address is required';
    if (!city.trim()) newErrors.city = 'City is required';
    if (!state.trim()) newErrors.state = 'State is required';
    if (!pinCode.match(/^\d{6}$/)) newErrors.pinCode = 'Enter a valid 6-digit pin code';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to top of form
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Generate Mock Order ID
    const randomId = `YP-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderId(randomId);

    // Calculate delivery date
    const today = new Date();
    const daysToAdd = shippingMethod === 'hand' ? 1 : shippingMethod === 'express' ? 2 : 5;
    today.setDate(today.getDate() + daysToAdd);
    const dateStr = today.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    setEstimatedDelivery(dateStr);

    setIsOrdered(true);
    clearCart();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAutofillAddress = () => {
    setFirstName('Jayant');
    setLastName('Olhyan');
    setAddress('M-81, Block M, GK-II');
    setCity('New Delhi');
    setState('Delhi');
    setPinCode('110048');
  };

  if (isOrdered) {
    return (
      <div className={styles.successContainer}>
        <CheckCircle size={64} style={{ color: 'var(--color-success)', margin: '0 auto' }} />
        <h1 className={styles.successTitle}>Order Placed Successfully!</h1>
        <p className={styles.successText}>
          Thank you for shopping with Yaperz. Your order has been registered and is being processed.
          A confirmation email has been sent to <strong>{email}</strong>.
        </p>

        <div>
          <span className={styles.orderNumber}>Order ID: {orderId}</span>
        </div>

        <p className={styles.successText} style={{ marginBottom: 40 }}>
          Estimated Delivery Date:<br />
          <strong>{estimatedDelivery}</strong>
        </p>

        <Link href="/collections/all-products" className={styles.continueBtn}>
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <AlertCircle size={48} style={{ color: 'var(--color-accent)', marginBottom: 16 }} />
        <h2 style={{ fontSize: 24, marginBottom: 16 }}>Your Bag is Empty</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 32 }}>
          You need items in your bag to access checkout.
        </p>
        <Link href="/collections/all-products" style={{ background: 'var(--color-text-primary)', color: '#fff', padding: '12px 32px' }}>
          Shop Collections
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div style={{ marginBottom: 24, textAlign: 'left' }}>
        <Link href="/collections/all-products" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-text-muted)' }}>
          <ArrowLeft size={16} /> Back to shop
        </Link>
      </div>
      <h1 className={styles.title}>Checkout</h1>

      <div className={styles.layout}>
        {/* Left Column: Checkout Form */}
        <form onSubmit={handlePlaceOrder}>
          {/* Contact Details */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Contact Details</h2>
            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <label className={styles.label}>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                  placeholder="name@email.com"
                />
                {errors.email && <span className={styles.errorText}>{errors.email}</span>}
              </div>
              <div className={styles.inputWrapper}>
                <label className={styles.label}>Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={styles.input}
                  placeholder="10-digit mobile number"
                />
                {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className={styles.formSection}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: 8, marginBottom: 8 }}>
              <h2 className={styles.sectionTitle} style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>Shipping Address</h2>
              <button 
                type="button" 
                onClick={handleAutofillAddress}
                style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-accent)', cursor: 'pointer', background: 'none', border: 'none' }}>
                Use Saved Address
              </button>
            </div>
            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <label className={styles.label}>First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={styles.input}
                  placeholder="First name"
                />
                {errors.firstName && <span className={styles.errorText}>{errors.firstName}</span>}
              </div>
              <div className={styles.inputWrapper}>
                <label className={styles.label}>Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={styles.input}
                  placeholder="Last name"
                />
                {errors.lastName && <span className={styles.errorText}>{errors.lastName}</span>}
              </div>
            </div>

            <div className={styles.inputWrapper}>
              <label className={styles.label}>Address Line 1</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={styles.input}
                placeholder="Street Address, P.O. Box, etc."
              />
              {errors.address && <span className={styles.errorText}>{errors.address}</span>}
            </div>

            <div className={styles.inputWrapper}>
              <label className={styles.label}>Apartment, Suite, Unit (Optional)</label>
              <input
                type="text"
                value={apartment}
                onChange={(e) => setApartment(e.target.value)}
                className={styles.input}
                placeholder="Apt, Suite, Building, Floor, etc."
              />
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <label className={styles.label}>City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={styles.input}
                  placeholder="City"
                />
                {errors.city && <span className={styles.errorText}>{errors.city}</span>}
              </div>
              <div className={styles.inputWrapper}>
                <label className={styles.label}>State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className={styles.input}
                  placeholder="State"
                />
                {errors.state && <span className={styles.errorText}>{errors.state}</span>}
              </div>
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <label className={styles.label}>Pin Code</label>
                <input
                  type="text"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className={styles.input}
                  placeholder="6-digit PIN code"
                />
                {errors.pinCode && <span className={styles.errorText}>{errors.pinCode}</span>}
              </div>
              <div className={styles.inputWrapper}>
                <label className={styles.label}>Country</label>
                <input
                  type="text"
                  value="India"
                  disabled
                  className={styles.input}
                  style={{ cursor: 'not-allowed' }}
                />
              </div>
            </div>
          </div>

          {/* Delivery Method */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Delivery Method</h2>
            <div className={styles.radioGrid}>
              <label
                className={`${styles.radioLabel} ${shippingMethod === 'standard' ? styles.radioLabelActive : ''}`}
              >
                <div className={styles.radioLeft}>
                  <input
                    type="radio"
                    checked={shippingMethod === 'standard'}
                    onChange={() => setShippingMethod('standard')}
                    className={styles.radioInput}
                  />
                  <div>
                    <span className={styles.radioTitle}>Standard Shipping</span>
                    <p className={styles.radioDesc}>Delivered in 3 to 5 business days</p>
                  </div>
                </div>
                <span className={styles.radioPrice}>
                  {cartSubtotal >= 5000 ? 'FREE' : '₹ 150'}
                </span>
              </label>

              <label
                className={`${styles.radioLabel} ${shippingMethod === 'express' ? styles.radioLabelActive : ''}`}
              >
                <div className={styles.radioLeft}>
                  <input
                    type="radio"
                    checked={shippingMethod === 'express'}
                    onChange={() => setShippingMethod('express')}
                    className={styles.radioInput}
                  />
                  <div>
                    <span className={styles.radioTitle}>Express Shipping</span>
                    <p className={styles.radioDesc}>Delivered in 1 to 2 business days</p>
                  </div>
                </div>
                <span className={styles.radioPrice}>₹ 350</span>
              </label>

              <label
                className={`${styles.radioLabel} ${shippingMethod === 'hand' ? styles.radioLabelActive : ''}`}
              >
                <div className={styles.radioLeft}>
                  <input
                    type="radio"
                    checked={shippingMethod === 'hand'}
                    onChange={() => setShippingMethod('hand')}
                    className={styles.radioInput}
                  />
                  <div>
                    <span className={styles.radioTitle}>Hand Delivered by the Founding Team</span>
                    <p className={styles.radioDesc}>Personally delivered to you tomorrow</p>
                  </div>
                </div>
                <span className={styles.radioPrice}>₹ 6,000</span>
              </label>
            </div>
          </div>

          {/* Payment Method */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Payment Method</h2>
            <div className={styles.radioGrid}>
              <label
                className={`${styles.radioLabel} ${paymentMethod === 'razorpay' ? styles.radioLabelActive : ''}`}
              >
                <div className={styles.radioLeft}>
                  <input
                    type="radio"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                    className={styles.radioInput}
                  />
                  <div>
                    <span className={styles.radioTitle}>Razorpay (UPI / Cards / Wallets)</span>
                    <p className={styles.radioDesc}>Fast and secure checkout via UPI, Cards, Netbanking</p>
                  </div>
                </div>
              </label>

              <label
                className={`${styles.radioLabel} ${paymentMethod === 'cod' ? styles.radioLabelActive : ''}`}
              >
                <div className={styles.radioLeft}>
                  <input
                    type="radio"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className={styles.radioInput}
                  />
                  <div>
                    <span className={styles.radioTitle}>Cash on Delivery (COD)</span>
                    <p className={styles.radioDesc}>Pay in cash when order is delivered</p>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </form>

        {/* Right Column: Order Summary */}
        <div className={styles.summaryPanel}>
          <h2 className={styles.summaryTitle}>Order Summary</h2>
          <div className={styles.itemsList}>
            {cartItems.map((item) => (
              <div
                key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                className={styles.itemRow}
              >
                <div className={styles.itemImage}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.product.images[0]}
                    alt={item.product.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div className={styles.itemDetails}>
                  <h4 className={styles.itemName}>{item.product.title}</h4>
                  <p className={styles.itemMeta}>
                    Qty: {item.quantity} | Size: {item.selectedSize} | Color: {item.selectedColor}
                  </p>
                </div>
                <span className={styles.itemPrice}>
                  ₹ {(item.product.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div className={styles.breakdown}>
            <div className={styles.row}>
              <span>Subtotal</span>
              <span>₹ {cartSubtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className={styles.row}>
              <span>Shipping</span>
              <span>{shippingCost === 0 ? 'FREE' : `₹ ${shippingCost}`}</span>
            </div>
            <div className={styles.row}>
              <span>Taxes (12% GST Included)</span>
              <span>₹ {taxAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className={styles.rowTotal}>
              <span>Total</span>
              <span>₹ {grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button onClick={handlePlaceOrder} className={styles.submitBtn}>
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
}
