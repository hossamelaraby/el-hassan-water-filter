// Vercel Serverless Function: Secure Order Submission Handler
// Validates, sanitizes input and stores water filter candle orders in Supabase
import { supabaseFetch } from './_lib/supabase.js';

// Simple In-Memory Rate Limiting per IP (prevent spam)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5; // Max 5 orders per minute per IP

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }
  if (now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }
  entry.count++;
  return entry.count > MAX_REQUESTS;
}

export default async function handler(req, res) {
  // 1. Strict Security Headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Handle CORS
  const allowedOrigin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 2. Rate Limiting Check
  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  if (isRateLimited(clientIp)) {
    return res.status(429).json({ 
      error: 'لقد أرسلت عدة طلبات مؤخراً، يرجى الانتظار دقيقة قبل المحاولة مجدداً.' 
    });
  }

  try {
    const {
      customerName,
      customerPhone,
      productSelected,
      quantity = 1,
      governorate,
      cityRegion = '',
      detailedAddress,
      notes = '',
      packageId,
      packageName,
      packagePrice,
      shippingFee = 65,
      totalAmount
    } = req.body || {};

    // 3. Strict Server-Side Validation
    const cleanName = String(customerName || '').trim();
    const cleanPhone = String(customerPhone || '').replace(/[\s\-\+]/g, '').trim();
    const cleanGov = String(governorate || '').trim();
    const cleanCity = String(cityRegion || '').trim();
    const cleanAddress = String(detailedAddress || '').trim();
    const cleanNotes = String(notes || '').trim();
    const cleanQty = Number(quantity) || 1;
    const shipping = 65; // Fixed 65 EGP shipping for all governorates

    if (!cleanName || cleanName.length < 2 || cleanName.length > 80) {
      return res.status(400).json({ error: 'من فضلك اكتب الاسم بالكامل.' });
    }

    // Egyptian phone validation: 010, 011, 012, 015 (11 digits)
    const egyptPhoneRegex = /^01[0125][0-9]{8}$/;
    if (!egyptPhoneRegex.test(cleanPhone)) {
      return res.status(400).json({ error: 'من فضلك اكتب رقم هاتف مصري صحيح (مثال: 01012345678).' });
    }

    if (!cleanGov || cleanGov.length > 50) {
      return res.status(400).json({ error: 'من فضلك اختر المحافظة.' });
    }

    if (!cleanAddress || cleanAddress.length < 5 || cleanAddress.length > 250) {
      return res.status(400).json({ error: 'من فضلك اكتب العنوان بالتفصيل.' });
    }

    const priceMap = {
      'طقم شمع 3 مراحل (300 جنيه)': 300,
      'طقم شمع 5 مراحل (650 جنيه)': 650,
      'طقم شمع 7 مراحل (1,400 جنيه)': 1400,
      '3_stages': 300,
      '5_stages': 650,
      '7_stages': 1400
    };

    const targetPkgText = productSelected || packageName || 'طقم شمعات فلتر';
    const unitPrice = priceMap[productSelected] || priceMap[packageId] || 0;
    const subtotal = unitPrice ? unitPrice * cleanQty : (packagePrice || 'غير محدد');
    const calculatedTotal = unitPrice ? (subtotal + shipping) : (totalAmount || 'يحدد لاحقاً');

    const fullAddress = cleanCity ? `${cleanGov} - ${cleanCity} - ${cleanAddress}` : `${cleanGov} - ${cleanAddress}`;
    const desc = `المنتج: ${targetPkgText} | الكمية: ${cleanQty} | سعر المنتجات: ${subtotal} ج.م | مصاريف الشحن: ${shipping} ج.م | الإجمالي المطلوب عند الاستلام: ${calculatedTotal} ج.م | المدينة/المنطقة: ${cleanCity || 'غير محدد'} | الملاحظات: ${cleanNotes || 'لا يوجد'}`;

    // 4. Prepare DB record (Compatible with Supabase maintenance_requests schema)
    const record = {
      client_name: cleanName,
      client_phone: cleanPhone,
      device_type: `شمعات فلتر: ${targetPkgText}`,
      governorate_region: cleanGov,
      address: fullAddress,
      problem_description: desc,
      status: 'new',
      source: 'water_filter_direct_landing'
    };

    // 5. Store in Supabase
    await supabaseFetch('maintenance_requests', {
      method: 'POST',
      headers: {
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(record)
    });

    return res.status(200).json({
      success: true,
      shippingFee: shipping,
      totalAmount: calculatedTotal,
      message: 'تم استلام طلبك بنجاح وسنتواصل معك هاتفياً لتأكيد تفاصيل وموعد التوصيل.'
    });

  } catch (err) {
    return res.status(500).json({
      error: 'تعذر معالجة الطلب حالياً. يرجى المحاولة مرة أخرى لاحقاً.'
    });
  }
}
