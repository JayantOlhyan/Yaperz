/**
 * @page AdminSuite
 * @description Centralized administrative control center for Yaperz.
 * Manages video collections, stories reels, brand assets, DP, catalog inventory, and orders.
 */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Package,
  Film,
  Settings,
  ShoppingBag,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  LogOut,
  Upload,
  CheckCircle,
  AlertTriangle,
  Play,
  X,
  Eye,
  Smartphone,
  Tablet,
  Monitor,
  Copy,
  Search,
} from 'lucide-react';
import styles from './admin.module.css';
import { StoryItem, SiteConfig, Product, AdminOrder } from '@/types';

type AdminTab = 'dashboard' | 'stories' | 'brand' | 'products' | 'orders';

export default function AdminPage() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Simulator State
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simulatorDevice, setSimulatorDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');

  // Search & Filter States
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrderStatus, setSelectedOrderStatus] = useState('ALL');

  // Stats
  const [stats, setStats] = useState<{
    totalProducts: number;
    lowStockCount: number;
    totalOrders: number;
    totalRevenue: number;
    activeStoriesCount: number;
  } | null>(null);

  // Data states
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Story Modal State
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<StoryItem | null>(null);
  const [storyForm, setStoryForm] = useState({
    label: '',
    thumbnail: '',
    media: '',
    mediaType: 'image' as 'image' | 'video',
    ctaText: 'Explore',
    ctaLink: '/collections/new-in',
    duration: 5,
    isActive: true,
  });

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    title: '',
    slug: '',
    price: 18500,
    compare_at_price: '' as string | number,
    category: 'Hoodies',
    inventory: 15,
    description: '',
    care: '',
    images: '/images/products/hoodie-brown-1.jpg',
    sizes: 'XS, S, M, L, XL',
    colors: 'Black, White, Brown',
    tags: 'oversized, heavyweight',
  });

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  // 1. Load Data for all modules
  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, storiesRes, configRes, productsRes, ordersRes] = await Promise.all([
        fetch('/api/admin/stats').then((r) => r.json()),
        fetch('/api/admin/stories').then((r) => r.json()),
        fetch('/api/admin/site-config').then((r) => r.json()),
        fetch('/api/admin/products').then((r) => r.json()),
        fetch('/api/admin/orders').then((r) => r.json()),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (storiesRes.success) setStories(storiesRes.data);
      if (configRes.success) setSiteConfig(configRes.data);
      if (productsRes.success) setProducts(productsRes.data);
      if (ordersRes.success) setOrders(ordersRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Verify session on mount
  useEffect(() => {
    let mounted = true;
    const verify = async () => {
      try {
        const res = await fetch('/api/admin/auth');
        const data = await res.json();
        if (mounted) {
          if (data.authenticated) {
            setIsAuthenticated(true);
            loadAllData();
          } else {
            setIsAuthenticated(false);
          }
        }
      } catch {
        if (mounted) setIsAuthenticated(false);
      }
    };
    verify();
    return () => {
      mounted = false;
    };
  }, [loadAllData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAuth(true);
    setAuthError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        loadAllData();
      } else {
        setAuthError(data.error || 'Authentication failed');
      }
    } catch {
      setAuthError('Network error during authentication');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    });
    setIsAuthenticated(false);
    setPasscode('');
  };

  const showToast = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 3500);
  };

  // 3. File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        showToast(`Uploaded ${file.name} successfully!`);
        if (targetField === 'story_thumbnail') {
          setStoryForm((prev) => ({ ...prev, thumbnail: data.url }));
        } else if (targetField === 'story_media') {
          const isVideo = file.type.startsWith('video') || data.url.match(/\.(mp4|webm|mov)$/i);
          setStoryForm((prev) => ({
            ...prev,
            media: data.url,
            mediaType: isVideo ? 'video' : 'image',
          }));
        } else if (targetField === 'brand_dp') {
          if (siteConfig) {
            setSiteConfig({
              ...siteConfig,
              brand: { ...siteConfig.brand, displayPicture: data.url },
            });
          }
        } else if (targetField === 'hero_desktop') {
          if (siteConfig) {
            setSiteConfig({
              ...siteConfig,
              hero: { ...siteConfig.hero, desktopMedia: data.url },
            });
          }
        }
      }
    } catch {
      showToast('File upload failed.');
    }
  };

  const handleToggleStoryActive = async (story: StoryItem) => {
    try {
      const newActive = story.isActive === false;
      const res = await fetch('/api/admin/stories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: story.id, isActive: newActive }),
      });
      const data = await res.json();
      if (data.success) {
        setStories((prev) => prev.map((s) => (s.id === story.id ? data.data : s)));
        showToast(`Story "${story.label}" ${newActive ? 'activated' : 'hidden'}`);
      }
    } catch {
      showToast('Failed to update story status');
    }
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} to clipboard!`);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.slug.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCat =
      selectedCategory === 'ALL'
        ? true
        : selectedCategory === 'LOW_STOCK'
        ? p.inventory < 5
        : p.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.guestEmail.toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.trackingNumber && o.trackingNumber.toLowerCase().includes(orderSearch.toLowerCase()));
    const matchesStatus =
      selectedOrderStatus === 'ALL' ? true : o.status.toUpperCase() === selectedOrderStatus;
    return matchesSearch && matchesStatus;
  });

  // 4. Story Actions
  const handleSaveStory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStory) {
        // Update
        const res = await fetch('/api/admin/stories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingStory.id, ...storyForm }),
        });
        const data = await res.json();
        if (data.success) {
          setStories((prev) => prev.map((s) => (s.id === editingStory.id ? data.data : s)));
          showToast('Story updated successfully!');
        }
      } else {
        // Create
        const res = await fetch('/api/admin/stories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(storyForm),
        });
        const data = await res.json();
        if (data.success) {
          setStories((prev) => [data.data, ...prev]);
          showToast('New story published!');
        }
      }
      setIsStoryModalOpen(false);
      setEditingStory(null);
    } catch {
      showToast('Error saving story.');
    }
  };

  const handleDeleteStory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this story?')) return;
    try {
      const res = await fetch(`/api/admin/stories?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setStories((prev) => prev.filter((s) => s.id !== id));
        showToast('Story deleted.');
      }
    } catch {
      showToast('Failed to delete story.');
    }
  };

  // 5. Site Config Save
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteConfig) return;

    try {
      const res = await fetch('/api/admin/site-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteConfig),
      });
      const data = await res.json();
      if (data.success) {
        setSiteConfig(data.data);
        showToast('Brand assets & site configuration saved!');
      }
    } catch {
      showToast('Failed to update configuration.');
    }
  };

  // 6. Product Actions
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...productForm,
      price: Number(productForm.price),
      compare_at_price: productForm.compare_at_price ? Number(productForm.compare_at_price) : null,
      inventory: Number(productForm.inventory),
      sizes: productForm.sizes.split(',').map((s) => s.trim()).filter(Boolean),
      colors: productForm.colors.split(',').map((c) => c.trim()).filter(Boolean),
      tags: productForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
      images: productForm.images.split(',').map((img) => img.trim()).filter(Boolean),
    };

    try {
      if (editingProduct) {
        const res = await fetch('/api/admin/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingProduct.id, ...payload }),
        });
        const data = await res.json();
        if (data.success) {
          setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? data.data : p)));
          showToast('Product updated successfully!');
        }
      } else {
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setProducts((prev) => [data.data, ...prev]);
          showToast('Product added to catalog!');
        }
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
    } catch {
      showToast('Failed to save product.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to remove this product from the storefront?')) return;
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        showToast('Product removed.');
      }
    } catch {
      showToast('Failed to delete product.');
    }
  };

  // 7. Order Status Update
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string, trackingNumber?: string, carrier?: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus, trackingNumber, carrier }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data.data : o)));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(data.data);
        }
        showToast(`Order status updated to ${newStatus}`);
      }
    } catch {
      showToast('Failed to update order status');
    }
  };

  // If checking authentication
  if (isAuthenticated === null) {
    return (
      <div className={styles.authContainer}>
        <div style={{ color: '#ffffff', fontSize: 14 }}>Authenticating secure session...</div>
      </div>
    );
  }

  // Passcode Auth Gate
  if (!isAuthenticated) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.authBadge}>YAPERZ CONTROL</div>
          <h1 className={styles.authTitle}>Admin Portal</h1>
          <p className={styles.authSubtitle}>
            Enter administrator passcode to access video collections, store DP, catalog, and fulfillment.
          </p>
          <form onSubmit={handleLogin} className={styles.authForm}>
            <input
              type="password"
              placeholder="••••••••••••"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className={styles.authInput}
              autoFocus
              required
            />
            <button type="submit" disabled={isSubmittingAuth} className={styles.authButton}>
              {isSubmittingAuth ? 'Verifying...' : 'Access Dashboard'}
            </button>
            {authError && <div className={styles.authError}>{authError}</div>}
          </form>
          <div style={{ marginTop: 24, fontSize: 11, color: '#555566' }}>
            Default passcode: <code>yaperz-admin-2026</code>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard
  return (
    <div className={styles.adminWrapper}>
      {/* Top Header */}
      <header className={styles.adminHeader}>
        <div className={styles.brandInfo}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={siteConfig?.brand.displayPicture || '/images/hero-desktop.png'}
            alt="Store DP"
            className={styles.brandAvatar}
          />
          <div className={styles.brandText}>
            <h1>{siteConfig?.brand.name || 'Yaperz'} Admin</h1>
            <span>Editorial Commerce Control Hub</span>
          </div>
        </div>
        <div className={styles.headerActions}>
          {feedbackMsg && (
            <span style={{ color: '#34d399', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle size={14} /> {feedbackMsg}
            </span>
          )}
          <button
            onClick={() => setIsSimulatorOpen(true)}
            className={styles.storeLink}
            style={{
              cursor: 'pointer',
              background: 'rgba(99, 102, 241, 0.15)',
              borderColor: 'rgba(99, 102, 241, 0.4)',
              color: '#818cf8',
            }}
            title="Preview live store in Mobile, Tablet, and Desktop viewports"
          >
            <Smartphone size={14} /> Device Simulator
          </button>
          <button onClick={loadAllData} className={styles.storeLink} style={{ cursor: 'pointer' }} title="Reload all data">
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <Link href="/" target="_blank" className={styles.storeLink}>
            <ExternalLink size={14} /> View Store
          </Link>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={14} /> Exit
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className={styles.navTabs}>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`${styles.tabButton} ${activeTab === 'dashboard' ? styles.tabActive : ''}`}
        >
          <TrendingUp size={16} /> Overview
        </button>
        <button
          onClick={() => setActiveTab('stories')}
          className={`${styles.tabButton} ${activeTab === 'stories' ? styles.tabActive : ''}`}
        >
          <Film size={16} /> Video Stories ({stories.length})
        </button>
        <button
          onClick={() => setActiveTab('brand')}
          className={`${styles.tabButton} ${activeTab === 'brand' ? styles.tabActive : ''}`}
        >
          <Settings size={16} /> Brand & DP
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`${styles.tabButton} ${activeTab === 'products' ? styles.tabActive : ''}`}
        >
          <Package size={16} /> Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`${styles.tabButton} ${activeTab === 'orders' ? styles.tabActive : ''}`}
        >
          <ShoppingBag size={16} /> Orders ({orders.length})
        </button>
      </nav>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        {/* =========================================================================
            TAB 1: DASHBOARD
           ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>
                  Total Revenue <TrendingUp size={16} />
                </div>
                <div className={styles.statValue}>
                  ₹{(Number(stats?.totalRevenue || 0) / 100).toLocaleString('en-IN')}
                </div>
                <div className={styles.statSubtext}>Across all completed orders</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>
                  Active Orders <ShoppingBag size={16} />
                </div>
                <div className={styles.statValue}>{stats?.totalOrders || orders.length}</div>
                <div className={styles.statSubtext}>Tracked in live fulfillment pipeline</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>
                  Products in Catalog <Package size={16} />
                </div>
                <div className={styles.statValue}>{stats?.totalProducts || products.length}</div>
                <div className={styles.statSubtext}>
                  {stats?.lowStockCount ? (
                    <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <AlertTriangle size={12} /> {stats.lowStockCount} items low stock
                    </span>
                  ) : (
                    'Inventory healthy across all SKUs'
                  )}
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>
                  Video Stories <Film size={16} />
                </div>
                <div className={styles.statValue}>{stats?.activeStoriesCount || stories.length}</div>
                <div className={styles.statSubtext}>Interactive mobile & tablet reels active</div>
              </div>
            </div>

            {/* Visual Analytics Chart Card */}
            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <div>
                  <h3 className={styles.chartTitle}>7-Day Revenue Velocity & Order Flow</h3>
                  <p style={{ color: '#71717a', fontSize: 12, margin: '4px 0 0' }}>
                    Completed drop sales volume across recent streetwear drop cycles
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#34d399', fontWeight: 600 }}>● Live Fulfillment Pipeline</span>
                </div>
              </div>
              <div className={styles.chartBarsContainer}>
                {[
                  { day: 'Mon', height: '45%', amount: '₹14,500', orders: 2 },
                  { day: 'Tue', height: '65%', amount: '₹28,200', orders: 4 },
                  { day: 'Wed', height: '35%', amount: '₹11,000', orders: 1 },
                  { day: 'Thu', height: '80%', amount: '₹42,000', orders: 6 },
                  { day: 'Fri', height: '95%', amount: '₹56,400', orders: 8 },
                  { day: 'Sat', height: '70%', amount: '₹34,800', orders: 5 },
                  { day: 'Sun', height: '85%', amount: '₹48,000', orders: 7 },
                ].map((item, idx) => (
                  <div key={idx} className={styles.chartCol}>
                    <div
                      className={styles.chartBarFill}
                      style={{ height: item.height }}
                      title={`${item.day}: ${item.amount} (${item.orders} orders)`}
                    />
                    <span className={styles.chartBarLabel}>{item.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions & Recent Orders preview */}
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Recent Orders</h2>
              <button onClick={() => setActiveTab('orders')} className={styles.secondaryBtn}>
                Manage All Orders
              </button>
            </div>

            <div className={styles.tableCard}>
              <div className={styles.tableWrapper}>
                <table className={styles.adminTable}>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id}>
                        <td style={{ fontWeight: 600 }}>{order.orderNumber}</td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>{order.guestEmail}</td>
                        <td>₹{(order.grandTotal / 100).toLocaleString('en-IN')}</td>
                        <td>
                          <span
                            className={`${styles.badge} ${
                              order.status === 'DELIVERED'
                                ? styles.badgeSuccess
                                : order.status === 'SHIPPED'
                                ? styles.badgeInfo
                                : styles.badgeWarning
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setActiveTab('orders');
                            }}
                            className={styles.iconBtn}
                          >
                            <Eye size={12} /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: VIDEO STORIES & REELS
           ========================================================================= */}
        {activeTab === 'stories' && (
          <div>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Video Collections & Ephemeral Stories</h2>
                <p style={{ color: '#888899', fontSize: 13, margin: '4px 0 0 0' }}>
                  Manage the swipeable story reels displayed across Mobile, Tablet, and Desktop storefronts.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingStory(null);
                  setStoryForm({
                    label: '',
                    thumbnail: '',
                    media: '',
                    mediaType: 'image',
                    ctaText: 'Explore',
                    ctaLink: '/collections/new-in',
                    duration: 5,
                    isActive: true,
                  });
                  setIsStoryModalOpen(true);
                }}
                className={styles.actionBtn}
              >
                <Plus size={16} /> Add Story / Video
              </button>
            </div>

            <div className={styles.storiesGrid}>
              {stories.map((story) => (
                <div key={story.id} className={styles.storyCard}>
                  <div className={styles.storyMediaWrapper}>
                    {story.mediaType === 'video' ? (
                      <video
                        src={story.media}
                        poster={story.thumbnail}
                        className={styles.storyVideoPreview}
                        muted
                        loop
                        playsInline
                        onMouseOver={(e) => (e.target as HTMLVideoElement).play().catch(() => {})}
                        onMouseOut={(e) => (e.target as HTMLVideoElement).pause()}
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={story.media} alt={story.label} className={styles.storyThumbnail} />
                    )}
                    <div className={styles.storyBadge}>
                      {story.mediaType === 'video' ? <Play size={10} fill="#fff" /> : <Eye size={10} />}
                      {story.mediaType === 'video' ? 'Video' : 'Image'}
                    </div>
                  </div>
                  <div className={styles.storyDetails}>
                    <h3 className={styles.storyTitle}>{story.label}</h3>
                    <div className={styles.storyActions}>
                      <button
                        onClick={() => handleToggleStoryActive(story)}
                        className={styles.iconBtn}
                        style={{
                          color: story.isActive !== false ? '#34d399' : '#a1a1aa',
                          borderColor: story.isActive !== false ? 'rgba(52, 211, 153, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                          flex: '0 0 auto',
                          padding: '8px 10px',
                        }}
                        title="Click to toggle story visibility on storefront"
                      >
                        {story.isActive !== false ? '● Live' : '○ Hidden'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingStory(story);
                          setStoryForm({
                            label: story.label,
                            thumbnail: story.thumbnail,
                            media: story.media,
                            mediaType: story.mediaType || 'image',
                            ctaText: story.ctaText,
                            ctaLink: story.ctaLink,
                            duration: story.duration || 5,
                            isActive: story.isActive !== false,
                          });
                          setIsStoryModalOpen(true);
                        }}
                        className={styles.iconBtn}
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                      <button onClick={() => handleDeleteStory(story.id)} className={`${styles.iconBtn} ${styles.dangerBtn}`}>
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: BRAND ASSETS & DP
           ========================================================================= */}
        {activeTab === 'brand' && siteConfig && (
          <form onSubmit={handleSaveConfig} style={{ maxWidth: 840 }}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Brand Assets, Store DP & Editorial Media</h2>
                <p style={{ color: '#888899', fontSize: 13, margin: '4px 0 0 0' }}>
                  Update your brand identity, store DP, hero video banner, and announcement text.
                </p>
              </div>
              <button type="submit" className={styles.actionBtn}>
                <CheckCircle size={16} /> Save Changes
              </button>
            </div>

            <div className={styles.tableCard} style={{ padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, marginBottom: 18, color: '#ffffff' }}>Store Profile & DP (Display Picture)</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={siteConfig.brand.displayPicture}
                  alt="Store Avatar Preview"
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid rgba(255,255,255,0.2)',
                  }}
                />
                <div style={{ flex: 1 }}>
                  <label className={styles.formLabel}>Upload New Store DP / Avatar</label>
                  <div className={styles.fileInputWrapper} style={{ marginTop: 8 }}>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={siteConfig.brand.displayPicture}
                      onChange={(e) =>
                        setSiteConfig({
                          ...siteConfig,
                          brand: { ...siteConfig.brand, displayPicture: e.target.value },
                        })
                      }
                      placeholder="/images/hero-desktop.png or https://..."
                      style={{ flex: 1 }}
                    />
                    <label className={styles.uploadTrigger}>
                      <Upload size={14} /> Upload DP
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(e, 'brand_dp')}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Brand Name</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={siteConfig.brand.name}
                    onChange={(e) =>
                      setSiteConfig({
                        ...siteConfig,
                        brand: { ...siteConfig.brand, name: e.target.value },
                      })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Brand Tagline</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={siteConfig.brand.tagline}
                    onChange={(e) =>
                      setSiteConfig({
                        ...siteConfig,
                        brand: { ...siteConfig.brand, tagline: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className={styles.tableCard} style={{ padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, marginBottom: 18, color: '#ffffff' }}>Announcement Ticker Bar</h3>
              <div className={styles.formGrid}>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.formLabel}>Announcement Message</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={siteConfig.brand.announcement.text}
                    onChange={(e) =>
                      setSiteConfig({
                        ...siteConfig,
                        brand: {
                          ...siteConfig.brand,
                          announcement: {
                            ...siteConfig.brand.announcement,
                            text: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Announcement Link</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={siteConfig.brand.announcement.link}
                    onChange={(e) =>
                      setSiteConfig({
                        ...siteConfig,
                        brand: {
                          ...siteConfig.brand,
                          announcement: {
                            ...siteConfig.brand.announcement,
                            link: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </div>
                <div className={styles.formGroup} style={{ justifyContent: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginTop: 20 }}>
                    <input
                      type="checkbox"
                      checked={siteConfig.brand.announcement.enabled}
                      onChange={(e) =>
                        setSiteConfig({
                          ...siteConfig,
                          brand: {
                            ...siteConfig.brand,
                            announcement: {
                              ...siteConfig.brand.announcement,
                              enabled: e.target.checked,
                            },
                          },
                        })
                      }
                    />
                    <span style={{ fontSize: 13, color: '#ffffff' }}>Show Announcement Bar on Storefront</span>
                  </label>
                </div>
              </div>
            </div>

            <div className={styles.tableCard} style={{ padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, marginBottom: 18, color: '#ffffff' }}>Hero Section & Editorial Video</h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Hero Media Format</label>
                  <select
                    className={styles.formSelect}
                    value={siteConfig.hero.mediaType}
                    onChange={(e) =>
                      setSiteConfig({
                        ...siteConfig,
                        hero: {
                          ...siteConfig.hero,
                          mediaType: e.target.value as 'image' | 'video',
                        },
                      })
                    }
                  >
                    <option value="image">Still Editorial Image</option>
                    <option value="video">Autoplay Background Video</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Desktop Video / Image Media URL</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={siteConfig.hero.desktopMedia}
                    onChange={(e) =>
                      setSiteConfig({
                        ...siteConfig,
                        hero: { ...siteConfig.hero, desktopMedia: e.target.value },
                      })
                    }
                  />
                </div>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.formLabel}>Hero Headline</label>
                  <textarea
                    className={styles.formTextarea}
                    rows={2}
                    value={siteConfig.hero.title}
                    onChange={(e) =>
                      setSiteConfig({
                        ...siteConfig,
                        hero: { ...siteConfig.hero, title: e.target.value },
                      })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>CTA Button Text</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={siteConfig.hero.ctaText}
                    onChange={(e) =>
                      setSiteConfig({
                        ...siteConfig,
                        hero: { ...siteConfig.hero, ctaText: e.target.value },
                      })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>CTA Destination Link</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={siteConfig.hero.ctaLink}
                    onChange={(e) =>
                      setSiteConfig({
                        ...siteConfig,
                        hero: { ...siteConfig.hero, ctaLink: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </form>
        )}

        {/* =========================================================================
            TAB 4: CATALOG & INVENTORY (PRODUCTS)
           ========================================================================= */}
        {activeTab === 'products' && (
          <div>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Product Catalog & Stock Management ({filteredProducts.length})</h2>
                <p style={{ color: '#888899', fontSize: 13, margin: '4px 0 0 0' }}>
                  Manage streetwear drops, variants, inventory, and pricing.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({
                    title: '',
                    slug: '',
                    price: 18500,
                    compare_at_price: '',
                    category: 'Hoodies',
                    inventory: 10,
                    description: 'Premium heavyweight streetwear hoodie engineered with bespoke craftsmanship.',
                    care: 'Machine wash cold inside out with like colors.',
                    images: '/images/products/hoodie-brown-1.jpg',
                    sizes: 'S, M, L, XL',
                    colors: 'Brown, Black',
                    tags: 'new-in, heavyweight',
                  });
                  setIsProductModalOpen(true);
                }}
                className={styles.actionBtn}
              >
                <Plus size={16} /> Add Product
              </button>
            </div>

            {/* Search and Category Filter Bar */}
            <div className={styles.searchFilterBar}>
              <div className={styles.searchInputWrapper}>
                <Search size={14} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search drops by title or slug..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className={styles.searchInputField}
                />
              </div>
              <div className={styles.filterPills}>
                {['ALL', 'Hoodies', 'Jackets', 'T-Shirts', 'Caps', 'Cases', 'LOW_STOCK'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`${styles.filterPill} ${selectedCategory === cat ? styles.filterPillActive : ''}`}
                  >
                    {cat === 'LOW_STOCK' ? '⚠️ Low Stock' : cat}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.tableCard}>
              <div className={styles.tableWrapper}>
                <table className={styles.adminTable}>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((prod) => (
                      <tr key={prod.id}>
                        <td>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={prod.images[0] || '/images/hero-desktop.png'}
                            alt={prod.title}
                            className={styles.tableThumb}
                          />
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#ffffff' }}>{prod.title}</div>
                          <div style={{ fontSize: 11, color: '#7a7a8c' }}>/{prod.slug}</div>
                        </td>
                        <td>{prod.category}</td>
                        <td style={{ fontWeight: 600 }}>₹{prod.price.toLocaleString('en-IN')}</td>
                        <td>
                          <span
                            className={`${styles.badge} ${
                              prod.inventory > 5
                                ? styles.badgeSuccess
                                : prod.inventory > 0
                                ? styles.badgeWarning
                                : styles.badgeNeutral
                            }`}
                          >
                            {prod.inventory > 0 ? `${prod.inventory} in stock` : 'Sold out'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => {
                                setEditingProduct(prod);
                                setProductForm({
                                  title: prod.title,
                                  slug: prod.slug,
                                  price: prod.price,
                                  compare_at_price: prod.compare_at_price || '',
                                  category: prod.category,
                                  inventory: prod.inventory,
                                  description: prod.description,
                                  care: prod.care,
                                  images: prod.images.join(', '),
                                  sizes: prod.sizes.join(', '),
                                  colors: prod.colors.join(', '),
                                  tags: prod.tags.join(', '),
                                });
                                setIsProductModalOpen(true);
                              }}
                              className={styles.iconBtn}
                            >
                              <Edit2 size={12} /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className={`${styles.iconBtn} ${styles.dangerBtn}`}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 5: ORDERS & FULFILLMENT
           ========================================================================= */}
        {activeTab === 'orders' && (
          <div>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Orders & Real-Time Logistics ({filteredOrders.length})</h2>
                <p style={{ color: '#888899', fontSize: 13, margin: '4px 0 0 0' }}>
                  Review customer transactions, update order fulfillment stages, and attach tracking AWBs.
                </p>
              </div>
            </div>

            {/* Search and Status Filter Bar */}
            <div className={styles.searchFilterBar}>
              <div className={styles.searchInputWrapper}>
                <Search size={14} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search orders by number, email, or AWB..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className={styles.searchInputField}
                />
              </div>
              <div className={styles.filterPills}>
                {['ALL', 'PENDING', 'PAID', 'CONFIRMED', 'SHIPPED', 'DELIVERED'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedOrderStatus(status)}
                    className={`${styles.filterPill} ${selectedOrderStatus === status ? styles.filterPillActive : ''}`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.tableCard}>
              <div className={styles.tableWrapper}>
                <table className={styles.adminTable}>
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Date</th>
                      <th>Customer & Phone</th>
                      <th>Items</th>
                      <th>Grand Total</th>
                      <th>Status</th>
                      <th>Logistics / AWB</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '32px 0', color: '#7a7a8c' }}>
                          No orders found matching criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order.id}>
                          <td style={{ fontWeight: 700 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span>{order.orderNumber}</span>
                              <button
                                type="button"
                                onClick={() => handleCopyText(order.orderNumber, 'Order Number')}
                                title="Copy Order Number"
                                className={styles.iconBtn}
                                style={{ padding: '2px 4px' }}
                              >
                                <Copy size={11} />
                              </button>
                            </div>
                          </td>
                          <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div>{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</div>
                            <div style={{ fontSize: 11, color: '#7a7a8c' }}>{order.guestPhone}</div>
                          </td>
                          <td>{order.items.length} item(s)</td>
                          <td style={{ fontWeight: 600 }}>₹{(order.grandTotal / 100).toLocaleString('en-IN')}</td>
                          <td>
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              className={styles.formSelect}
                              style={{ padding: '4px 8px', fontSize: 12 }}
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="PAID">PAID</option>
                              <option value="CONFIRMED">CONFIRMED</option>
                              <option value="SHIPPED">SHIPPED</option>
                              <option value="DELIVERED">DELIVERED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </td>
                          <td>
                            {order.trackingNumber ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                                <div>
                                  <span style={{ color: '#34d399' }}>{order.carrier || 'Delhivery Express'}</span>: {order.trackingNumber}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleCopyText(order.trackingNumber!, 'AWB Tracking Number')}
                                  title="Copy AWB Tracking Number"
                                  className={styles.iconBtn}
                                  style={{ padding: '2px 4px' }}
                                >
                                  <Copy size={11} />
                                </button>
                              </div>
                            ) : (
                              <span style={{ color: '#888899', fontSize: 11 }}>Not assigned</span>
                            )}
                          </td>
                          <td>
                            <button onClick={() => setSelectedOrder(order)} className={styles.iconBtn}>
                              <Eye size={12} /> View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          MODAL: ADD / EDIT STORY
         ========================================================================= */}
      {isStoryModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsStoryModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingStory ? 'Edit Story Reel' : 'Add Story / Video Collection'}</h2>
              <button onClick={() => setIsStoryModalOpen(false)} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveStory}>
              <div className={styles.formGrid}>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.formLabel}>Story Label / Title</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={storyForm.label}
                    onChange={(e) => setStoryForm({ ...storyForm, label: e.target.value })}
                    placeholder="e.g. Winter Drop, Racing Club"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Media Type</label>
                  <select
                    className={styles.formSelect}
                    value={storyForm.mediaType}
                    onChange={(e) => setStoryForm({ ...storyForm, mediaType: e.target.value as 'image' | 'video' })}
                  >
                    <option value="image">Still Image</option>
                    <option value="video">Short Video (MP4 / WebM)</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Duration (Seconds)</label>
                  <input
                    type="number"
                    className={styles.formInput}
                    value={storyForm.duration}
                    onChange={(e) => setStoryForm({ ...storyForm, duration: Number(e.target.value) })}
                    min={3}
                    max={30}
                  />
                </div>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.formLabel}>Thumbnail DP / Avatar URL</label>
                  <div className={styles.fileInputWrapper}>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={storyForm.thumbnail}
                      onChange={(e) => setStoryForm({ ...storyForm, thumbnail: e.target.value })}
                      placeholder="/images/products/hoodie-brown-1.jpg or upload"
                      style={{ flex: 1 }}
                      required
                    />
                    <label className={styles.uploadTrigger}>
                      <Upload size={14} /> Upload DP
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(e, 'story_thumbnail')}
                      />
                    </label>
                  </div>
                </div>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.formLabel}>Full Media (Video or Image) URL</label>
                  <div className={styles.fileInputWrapper}>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={storyForm.media}
                      onChange={(e) => setStoryForm({ ...storyForm, media: e.target.value })}
                      placeholder="/images/products/hoodie-brown-1.jpg or /uploads/video.mp4"
                      style={{ flex: 1 }}
                      required
                    />
                    <label className={styles.uploadTrigger}>
                      <Upload size={14} /> Upload Media
                      <input
                        type="file"
                        accept="image/*,video/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(e, 'story_media')}
                      />
                    </label>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>CTA Button Text</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={storyForm.ctaText}
                    onChange={(e) => setStoryForm({ ...storyForm, ctaText: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>CTA Link Destination</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={storyForm.ctaLink}
                    onChange={(e) => setStoryForm({ ...storyForm, ctaLink: e.target.value })}
                  />
                </div>
              </div>
              <div className={styles.formActions}>
                <button type="button" onClick={() => setIsStoryModalOpen(false)} className={styles.secondaryBtn}>
                  Cancel
                </button>
                <button type="submit" className={styles.actionBtn}>
                  {editingStory ? 'Save Changes' : 'Create Story'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD / EDIT PRODUCT
         ========================================================================= */}
      {isProductModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsProductModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingProduct ? 'Edit Product' : 'Add New Streetwear Drop'}</h2>
              <button onClick={() => setIsProductModalOpen(false)} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveProduct}>
              <div className={styles.formGrid}>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.formLabel}>Product Title</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={productForm.title}
                    onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Category</label>
                  <select
                    className={styles.formSelect}
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  >
                    <option value="Hoodies">Hoodies</option>
                    <option value="Jackets">Jackets</option>
                    <option value="T-Shirts">T-Shirts</option>
                    <option value="Caps">Caps</option>
                    <option value="Cases">Cases</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Inventory (Stock Count)</label>
                  <input
                    type="number"
                    className={styles.formInput}
                    value={productForm.inventory}
                    onChange={(e) => setProductForm({ ...productForm, inventory: Number(e.target.value) })}
                    min={0}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Price (₹ INR)</label>
                  <input
                    type="number"
                    className={styles.formInput}
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Compare-At Price (₹ INR)</label>
                  <input
                    type="number"
                    className={styles.formInput}
                    value={productForm.compare_at_price}
                    onChange={(e) => setProductForm({ ...productForm, compare_at_price: e.target.value })}
                    placeholder="Original higher price"
                  />
                </div>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.formLabel}>Image URLs (Comma separated)</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={productForm.images}
                    onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Sizes (Comma separated)</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={productForm.sizes}
                    onChange={(e) => setProductForm({ ...productForm, sizes: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Colors (Comma separated)</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={productForm.colors}
                    onChange={(e) => setProductForm({ ...productForm, colors: e.target.value })}
                  />
                </div>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.formLabel}>Description</label>
                  <textarea
                    className={styles.formTextarea}
                    rows={2}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  />
                </div>
              </div>
              <div className={styles.formActions}>
                <button type="button" onClick={() => setIsProductModalOpen(false)} className={styles.secondaryBtn}>
                  Cancel
                </button>
                <button type="submit" className={styles.actionBtn}>
                  {editingProduct ? 'Save Product' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ORDER DETAILS & AWB ASSIGNMENT
         ========================================================================= */}
      {selectedOrder && (
        <div className={styles.modalOverlay} onClick={() => setSelectedOrder(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Order Details — {selectedOrder.orderNumber}</h2>
              <button onClick={() => setSelectedOrder(null)} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: '#888899', textTransform: 'uppercase' }}>Customer Info</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginTop: 4 }}>
                  {selectedOrder.shippingAddress?.firstName} {selectedOrder.shippingAddress?.lastName}
                </div>
                <div style={{ fontSize: 13, color: '#d1d1dc' }}>{selectedOrder.guestEmail} • {selectedOrder.guestPhone}</div>
                <div style={{ fontSize: 13, color: '#9999aa', marginTop: 4 }}>
                  {selectedOrder.shippingAddress?.addressLine1}, {selectedOrder.shippingAddress?.city},{' '}
                  {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.postalCode}
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 14 }}>
                <div style={{ fontSize: 12, color: '#888899', textTransform: 'uppercase', marginBottom: 8 }}>
                  Items Ordered
                </div>
                {selectedOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      fontSize: 13,
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, color: '#fff' }}>{item.productTitle}</span>
                      <div style={{ fontSize: 11, color: '#888899' }}>
                        Size: {item.size} | Color: {item.color} | Qty: {item.quantity}
                      </div>
                    </div>
                    <div style={{ fontWeight: 600 }}>₹{(item.lineTotal / 100).toLocaleString('en-IN')}</div>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontWeight: 700, fontSize: 15 }}>
                  <span>Total Amount Paid:</span>
                  <span style={{ color: '#34d399' }}>₹{(selectedOrder.grandTotal / 100).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 14 }}>
                <div style={{ fontSize: 12, color: '#888899', textTransform: 'uppercase', marginBottom: 8 }}>
                  Fulfillment & Courier Tracking
                </div>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Carrier Partner</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      defaultValue={selectedOrder.carrier || 'Delhivery Express'}
                      id="carrier_input"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Tracking Number (AWB)</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      defaultValue={selectedOrder.trackingNumber || ''}
                      id="tracking_input"
                      placeholder="e.g. DLV9827310IN"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  style={{ marginTop: 12 }}
                  className={styles.actionBtn}
                  onClick={() => {
                    const carrierEl = document.getElementById('carrier_input') as HTMLInputElement;
                    const trackingEl = document.getElementById('tracking_input') as HTMLInputElement;
                    handleUpdateOrderStatus(
                      selectedOrder.id,
                      selectedOrder.status,
                      trackingEl?.value,
                      carrierEl?.value
                    );
                  }}
                >
                  Save Tracking Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: DEVICE SIMULATOR (MOBILE / TABLET / DESKTOP PREVIEW)
         ========================================================================= */}
      {isSimulatorOpen && (
        <div className={styles.simulatorOverlay} onClick={() => setIsSimulatorOpen(false)}>
          <div className={styles.simulatorTopBar} onClick={(e) => e.stopPropagation()}>
            <div className={styles.deviceSelector}>
              <button
                type="button"
                onClick={() => setSimulatorDevice('mobile')}
                className={`${styles.deviceToggleBtn} ${simulatorDevice === 'mobile' ? styles.deviceToggleBtnActive : ''}`}
              >
                <Smartphone size={14} /> Mobile (390px)
              </button>
              <button
                type="button"
                onClick={() => setSimulatorDevice('tablet')}
                className={`${styles.deviceToggleBtn} ${simulatorDevice === 'tablet' ? styles.deviceToggleBtnActive : ''}`}
              >
                <Tablet size={14} /> Tablet (768px)
              </button>
              <button
                type="button"
                onClick={() => setSimulatorDevice('desktop')}
                className={`${styles.deviceToggleBtn} ${simulatorDevice === 'desktop' ? styles.deviceToggleBtnActive : ''}`}
              >
                <Monitor size={14} /> Desktop (1080px)
              </button>
            </div>
            <button type="button" onClick={() => setIsSimulatorOpen(false)} className={styles.closeBtn}>
              <X size={20} />
            </button>
          </div>
          <div
            className={`${styles.simulatorFrame} ${
              simulatorDevice === 'mobile'
                ? styles.simulatorFrameMobile
                : simulatorDevice === 'tablet'
                ? styles.simulatorFrameTablet
                : styles.simulatorFrameDesktop
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <iframe src="/" className={styles.simulatorIframe} title="Live Storefront Device Simulator" />
          </div>
        </div>
      )}
    </div>
  );
}
