/**
 * إعدادات وبيانات صفحة الهبوط - مؤسسة الحسن لمعالجة مياه الشرب
 * يمكن تعديل القيم هنا بسهولة قبل النشر في الإنتاج.
 */
export const BUSINESS_CONFIG = {
  businessName: 'مؤسسة الحسن لمعالجة مياه الشرب',
  businessDescription: 'متخصصون في تنقية ومعالجة مياه الشرب وتوفير شمعات فلاتر المياه وقطع الغيار وخدمات تغيير الشمعات والصيانة.',
  location: 'الجيزة، مصر',
  // القيم الحالية هي عناصر نائبة قابلة للتعديل
  phonePlaceholder: '[رقم الهاتف]',
  whatsappPlaceholder: '[رقم الواتساب]',
  // إذا تم وضع رقم هاتف حقيقي (مثل "01012345678") سيتحول الرابط تلقائياً إلى رابط اتصال tel:
  realPhoneNumber: '', 
  // إذا تم وضع رقم واتساب حقيقي (مثل "201012345678") سيتحول إلى رابط واتساب نشط wa.me
  realWhatsAppNumber: '',
  deliveryCostPlaceholder: '[تكلفة الشحن]',
  deliveryDurationPlaceholder: '[مدة التوصيل]',
  paymentMethodPlaceholder: '[طريقة الدفع — مثال: الدفع عند الاستلام]',
  returnPolicyUrl: '', // [رابط سياسة الاستبدال والاسترجاع]
  privacyPolicyUrl: '', // [رابط سياسة الخصوصية]
  workHoursPlaceholder: '[مواعيد العمل]',
  // نقطة الربط مع الخادم الحقيقي لاستقبال الطلبات (Vercel Serverless Function)
  apiEndpoint: '/api/order'
};

export const PACKAGES = {
  '3_stages': {
    id: '3_stages',
    name: 'طقم 3 مراحل',
    price: 300,
    priceFormatted: '300 ج.م',
    description: 'مناسب لفلاتر المياه المنزلية ذات 3 مراحل.',
    tag: 'اقتصادي',
    image: 'https://lh3.googleusercontent.com/aida/ALJJyrCgIvuAgcjyruoX4J7icIeiqHTEhHpoqxvg_DwtJR-CFqgBf2XR4KVyhdT5hQNpPZugVsZKWcCR_mWEp7H10n5d441-2ppJ1Fvqtp_DJtBN0Ce3ZTnhPrjGGaDhNKebONvpU0vW6d44FYu2sQ0tHZO-2E7IP61W0Pq7o6C0Tswuct2aOw38H6e4QqJ-ET9PNPL9ucycIrz7VEIJIcygwhfVhiVK-g7yqmLtGj87Yb9mMA',
    features: [
      'عدد المراحل: 3 مراحل',
      'المرحلة 1: بولي بروبلين (PP)',
      'المرحلة 2: حبيبات كربون نشط (GAC)',
      'المرحلة 3: كربون بلوك مصمت (CTO)'
    ]
  },
  '5_stages': {
    id: '5_stages',
    name: 'طقم 5 مراحل',
    price: 650,
    priceFormatted: '650 ج.م',
    description: 'اختيار عملي لفلاتر المياه المنزلية ذات 5 مراحل.',
    tag: 'اختيار متوازن',
    image: 'https://lh3.googleusercontent.com/aida/ALJJyrAbHLwWDP6EkuorEeByA5kIA5-vnmUeO0wX81rtNc3mFYk23qIJR2zTmnyTA_QHchRatAdzDWC_soA5enEhhUSzhSiwSwhsagQqaYwTcvAKJUx8e_y3okxrtcPRIVMOI8irHJ0hvhans-BGwBoX_RadvU0f8-gEbP82eJbnT0kr2XT0HMpH-57ghWXsHaPtveVNamQJFk-W6TdwpQUqQNvmzLAW_sjimy-7V3XSNI4jCQ',
    features: [
      'عدد المراحل: 5 مراحل',
      'المراحل 1 إلى 3 الأساسية',
      'مرحلة 4 إضافية حسب نوع الفلتر',
      'مرحلة 5 إضافية حسب نوع الفلتر'
    ]
  },
  '7_stages': {
    id: '7_stages',
    name: 'طقم 7 مراحل',
    price: 1400,
    priceFormatted: '1,400 ج.م',
    description: 'طقم كامل لفلاتر المياه المنزلية ذات 7 مراحل.',
    tag: 'الطقم الكامل',
    image: 'https://lh3.googleusercontent.com/aida/ALJJyrBfFbIBnoZtSkuLqbhPF9Zw5DnWI9eJbi6hfWqfUSO5lmowJGSD6tzGi2_MTXgsUgD3tt-GEwDc53GWj7lTNnNNadxDamwJTaXNMDMpn_MeFDNLUS7SrK220Lky28OVpNo3cs-OUVuHFNfwmY4oFoPKaFR2q9qHpWUhPHHntcCEWNNf19DkqNA-g2ecPqTC5zVCRy7DUU-bwL0FOo-r5m5SwkAi_DaQrGEmv3CdAB8P',
    features: [
      'عدد المراحل: 7 مراحل كاملة',
      'المراحل 1 إلى 3 الأساسية',
      'المراحل 4 و 5 و 6 حسب نوع الفلتر',
      'المرحلة 7: بوست كربون أو حسب نوع الفلتر'
    ]
  }
};
