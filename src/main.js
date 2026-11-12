import { BUSINESS_CONFIG, PACKAGES } from './config.js';

// حالة التطبيق في المتصفح فقط (Client-side State)
let state = {
  selectedPackage: '5_stages',
  isSubmitting: false,
  selectedFile: null
};

// تهيئة عناصر واجهة المستخدم
export function initApp() {
  renderConfigElements();
  setupEventListeners();
  syncUI();
}

function renderConfigElements() {
  // تحديث نصوص العناصر النائبة ومسارات الاتصال
  const phoneLinks = document.querySelectorAll('.dynamic-phone');
  phoneLinks.forEach(el => {
    if (BUSINESS_CONFIG.realPhoneNumber) {
      el.textContent = BUSINESS_CONFIG.realPhoneNumber;
      if (el.tagName === 'A') {
        el.href = `tel:${BUSINESS_CONFIG.realPhoneNumber.replace(/\s+/g, '')}`;
      }
    } else {
      el.textContent = BUSINESS_CONFIG.phonePlaceholder;
      if (el.tagName === 'A') {
        el.removeAttribute('href');
        el.style.pointerEvents = 'none';
      }
    }
  });

  const whatsappLinks = document.querySelectorAll('.dynamic-whatsapp');
  whatsappLinks.forEach(el => {
    if (BUSINESS_CONFIG.realWhatsAppNumber) {
      el.textContent = BUSINESS_CONFIG.realWhatsAppNumber;
      if (el.tagName === 'A') {
        el.href = `https://wa.me/${BUSINESS_CONFIG.realWhatsAppNumber.replace(/\+/g, '')}`;
      }
    } else {
      el.textContent = BUSINESS_CONFIG.whatsappPlaceholder;
      if (el.tagName === 'A') {
        // إخفاء زر الواتساب أو تعطيله لعدم إنشاء رابط معطوب
        if (el.classList.contains('mobile-whatsapp-btn')) {
          el.classList.add('hidden');
        } else {
          el.removeAttribute('href');
          el.style.pointerEvents = 'none';
        }
      }
    }
  });
}

export function selectPackage(packageId) {
  if (PACKAGES[packageId]) {
    state.selectedPackage = packageId;
    syncUI();
    const orderSection = document.getElementById('order-section');
    if (orderSection) {
      orderSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

function syncUI() {
  const pkg = PACKAGES[state.selectedPackage];

  // 1. تحديث ملخص الباقة داخل نموذج الطلب
  const summaryName = document.getElementById('summaryPackageName');
  const summaryPrice = document.getElementById('summaryPackagePrice');
  if (summaryName && summaryPrice) {
    summaryName.textContent = pkg.name;
    summaryPrice.textContent = pkg.priceFormatted;
  }

  // 2. تحديث شريط الموبايل السفلي Sticky CTA
  const stickyInfo = document.getElementById('stickyPackageInfo');
  if (stickyInfo) {
    stickyInfo.textContent = `${pkg.name} (${pkg.priceFormatted})`;
  }

  // 3. مزامنة أزرار الراديو داخل النموذج
  const radios = document.querySelectorAll('input[name="selected_package"]');
  radios.forEach(radio => {
    radio.checked = radio.value === state.selectedPackage;
  });

  // 4. تحديث حالة وتنسيق كروت الراديو
  ['3', '5', '7'].forEach(num => {
    const radioCard = document.getElementById(`radio-card-${num}`);
    if (radioCard) {
      if (state.selectedPackage === `${num}_stages`) {
        radioCard.className = 'cursor-pointer border-2 border-brand-blue bg-brand-soft-bg rounded-xl p-3 text-center flex flex-col items-center justify-center transition shadow-sm';
      } else {
        radioCard.className = 'cursor-pointer border border-brand-border hover:border-brand-blue rounded-xl p-3 text-center flex flex-col items-center justify-center transition';
      }
    }
  });

  // 5. تحديث وتظليل كروت الباقات الرئيسية الثلاثة
  ['3', '5', '7'].forEach(num => {
    const card = document.getElementById(`card-package-${num}`);
    const btn = card?.querySelector('.select-pkg-btn');
    const isSelected = state.selectedPackage === `${num}_stages`;

    if (card) {
      card.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
      if (isSelected) {
        card.classList.add('border-brand-blue', 'ring-2', 'ring-brand-blue/30');
        card.classList.remove('border-brand-border');
        if (btn) {
          btn.classList.add('bg-brand-blue', 'text-white', 'shadow-md');
          btn.classList.remove('bg-slate-100', 'text-brand-navy');
          btn.textContent = `تم اختيار ${PACKAGES[`${num}_stages`].name}`;
        }
      } else {
        card.classList.remove('ring-2', 'ring-brand-blue/30');
        if (num !== '5') {
          card.classList.remove('border-brand-blue');
          card.classList.add('border-brand-border');
        }
        if (btn) {
          btn.classList.remove('bg-brand-blue', 'text-white', 'shadow-md');
          btn.classList.add('bg-slate-100', 'text-brand-navy');
          btn.textContent = `اختار ${PACKAGES[`${num}_stages`].name}`;
        }
      }
    }
  });
}

function setupEventListeners() {
  // أزرار اختيار الباقات في قسم العرض
  ['3', '5', '7'].forEach(num => {
    const card = document.getElementById(`card-package-${num}`);
    if (card) {
      card.addEventListener('click', () => selectPackage(`${num}_stages`));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectPackage(`${num}_stages`);
        }
      });
    }
  });

  // راديو اختيار الباقة داخل النموذج
  const radios = document.querySelectorAll('input[name="selected_package"]');
  radios.forEach(r => {
    r.addEventListener('change', (e) => {
      state.selectedPackage = e.target.value;
      syncUI();
    });
  });

  // تبويبات تفاصيل المراحل
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabTarget = btn.getAttribute('data-tab');
      document.querySelectorAll('.stage-tab-content').forEach(c => c.classList.add('hidden'));
      document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('bg-brand-blue', 'text-white');
        b.classList.add('bg-slate-100', 'text-brand-dark-text');
      });

      const activeContent = document.getElementById(`tab-content-${tabTarget}`);
      if (activeContent) activeContent.classList.remove('hidden');
      btn.classList.add('bg-brand-blue', 'text-white');
      btn.classList.remove('bg-slate-100', 'text-brand-dark-text');
    });
  });

  // أكورديون الأسئلة الشائعة FAQ
  const faqButtons = document.querySelectorAll('.faq-toggle-btn');
  faqButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const parent = btn.closest('.faq-item');
      const answer = parent.querySelector('.faq-answer');
      const icon = btn.querySelector('.faq-icon');
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';

      // إغلاق باقي الأسئلة
      faqButtons.forEach(otherBtn => {
        if (otherBtn !== btn) {
          otherBtn.setAttribute('aria-expanded', 'false');
          const otherParent = otherBtn.closest('.faq-item');
          const otherAnswer = otherParent.querySelector('.faq-answer');
          const otherIcon = otherBtn.querySelector('.faq-icon');
          if (otherAnswer) otherAnswer.classList.add('hidden');
          if (otherIcon) otherIcon.classList.remove('rotate-180');
        }
      });

      if (isExpanded) {
        btn.setAttribute('aria-expanded', 'false');
        if (answer) answer.classList.add('hidden');
        if (icon) icon.classList.remove('rotate-180');
      } else {
        btn.setAttribute('aria-expanded', 'true');
        if (answer) answer.classList.remove('hidden');
        if (icon) icon.classList.add('rotate-180');
      }
    });
  });

  // إرفاق الصورة (File Upload Security)
  const fileInput = document.getElementById('filterImage');
  const fileNotice = document.getElementById('fileUploadNotice');
  const removeFileBtn = document.getElementById('removeFileBtn');

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // فحص نوع الملف (Allow safe image types only)
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('من فضلك اختر صورة بصيغة صالحة (JPEG, PNG, WebP) فقط.');
        fileInput.value = '';
        state.selectedFile = null;
        return;
      }

      // فحص الحجم الأقصى (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الصورة كبير جداً، الحد الأقصى المسموح به هو 5 ميجابايت.');
        fileInput.value = '';
        state.selectedFile = null;
        return;
      }

      state.selectedFile = file;
      if (fileNotice) {
        fileNotice.textContent = `تم تحديد الصورة: ${file.name}`;
        fileNotice.classList.remove('hidden');
      }
      if (removeFileBtn) removeFileBtn.classList.remove('hidden');
    });
  }

  if (removeFileBtn) {
    removeFileBtn.addEventListener('click', () => {
      if (fileInput) fileInput.value = '';
      state.selectedFile = null;
      if (fileNotice) fileNotice.classList.add('hidden');
      removeFileBtn.classList.add('hidden');
    });
  }

  // نموذج الطلب
  const form = document.getElementById('orderForm');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }

  // زر العودة بعد إتمام التجربة
  const resetBtn = document.getElementById('resetOrderFormBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      const successState = document.getElementById('orderSuccessState');
      const errorState = document.getElementById('orderErrorState');
      if (successState) successState.classList.add('hidden');
      if (errorState) errorState.classList.add('hidden');
      if (form) {
        form.reset();
        form.classList.remove('hidden');
      }
      state.selectedFile = null;
      if (fileNotice) fileNotice.classList.add('hidden');
      if (removeFileBtn) removeFileBtn.classList.add('hidden');
      syncUI();
    });
  }
}

// معالجة إرسال النموذج والتحقق الصارم
async function handleFormSubmit(e) {
  e.preventDefault();
  if (state.isSubmitting) return;

  clearFormErrors();

  const fullNameInput = document.getElementById('fullName');
  const phoneInput = document.getElementById('phone');
  const govInput = document.getElementById('gov');
  const addressInput = document.getElementById('address');

  const fullName = fullNameInput?.value.trim() || '';
  const phone = phoneInput?.value.trim() || '';
  const gov = govInput?.value || '';
  const address = addressInput?.value.trim() || '';

  let hasError = false;

  // 1. التحقق من الاسم
  if (!fullName || fullName.length < 3) {
    showFieldError('fullName', 'من فضلك اكتب الاسم بالكامل.');
    hasError = true;
  }

  // 2. التحقق من رقم الهاتف المصري (010, 011, 012, 015 - 11 أرقام)
  const egyptPhoneRegex = /^01[0125][0-9]{8}$/;
  const cleanPhone = phone.replace(/[\s\-\+]/g, '');
  if (!cleanPhone || !egyptPhoneRegex.test(cleanPhone)) {
    showFieldError('phone', 'من فضلك اكتب رقم هاتف مصري صحيح (مثال: 01012345678).');
    hasError = true;
  }

  // 3. التحقق من المحافظة
  if (!gov) {
    showFieldError('gov', 'من فضلك اختر المحافظة.');
    hasError = true;
  }

  // 4. التحقق من العنوان
  if (!address || address.length < 5) {
    showFieldError('address', 'من فضلك اكتب العنوان بالتفصيل.');
    hasError = true;
  }

  if (hasError) return;

  // جمع باقي الحقول الاختيارية بأمان
  const currentStages = document.querySelector('input[name="current_filter_stages"]:checked')?.value || 'غير محدد';
  const needInstallation = document.querySelector('input[name="need_installation"]:checked')?.value || 'لا';

  const orderPayload = {
    packageId: state.selectedPackage,
    packageName: PACKAGES[state.selectedPackage].name,
    packagePrice: PACKAGES[state.selectedPackage].price,
    customerName: fullName,
    customerPhone: cleanPhone,
    governorate: gov,
    detailedAddress: address,
    currentFilterStages: currentStages,
    needInstallationService: needInstallation,
    hasImageAttached: !!state.selectedFile,
    submittedAt: new Date().toISOString()
  };

  // تفعيل حالة التحميل ومنع الإرسال المتكرر
  setSubmitting(true);

  try {
    const result = await submitOrder(orderPayload);
    if (result.success) {
      showOrderSuccess(orderPayload, result.isDemo);
    } else {
      showOrderError(result.message || 'حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى.');
    }
  } catch (err) {
    showOrderError('حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى أو تواصل معنا مباشرة.');
  } finally {
    setSubmitting(false);
  }
}

/**
 * دالة إرسال الطلب المعزولة (Isolated Submission Handler)
 * تدعم الـ Real Backend أو وضع التجربة الآمن (Safe Demo Mode)
 */
async function submitOrder(payload) {
  // محاكاة تأخير الشبكة لتوضيح حالة التحميل للمستخدم
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (BUSINESS_CONFIG.apiEndpoint) {
    // إرسال حقيقي للخادم إذا كان مهيأ
    try {
      const response = await fetch(BUSINESS_CONFIG.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return { success: true, isDemo: false };
    } catch (e) {
      return { success: false, message: 'تعذر الاتصال بالخادم. يرجى المحاولة لاحقاً.' };
    }
  } else {
    // وضع التجربة الآمن بدون حفظ أي PII في أي تخزين محلي
    return { success: true, isDemo: true };
  }
}

function setSubmitting(isSubmitting) {
  state.isSubmitting = isSubmitting;
  const submitBtn = document.getElementById('orderSubmitBtn');
  const submitText = document.getElementById('orderSubmitText');
  const submitSpinner = document.getElementById('orderSubmitSpinner');

  if (submitBtn) {
    submitBtn.disabled = isSubmitting;
    if (isSubmitting) {
      submitBtn.classList.add('opacity-75', 'cursor-not-allowed');
      if (submitText) submitText.textContent = 'جارٍ إرسال الطلب...';
      if (submitSpinner) submitSpinner.classList.remove('hidden');
    } else {
      submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
      if (submitText) submitText.textContent = 'تأكيد الطلب';
      if (submitSpinner) submitSpinner.classList.add('hidden');
    }
  }
}

function showOrderSuccess(payload, isDemo) {
  const form = document.getElementById('orderForm');
  const successState = document.getElementById('orderSuccessState');
  const summaryEl = document.getElementById('successSummaryDetails');
  const demoBanner = document.getElementById('demoModeNotice');

  if (form) form.classList.add('hidden');
  if (successState) successState.classList.remove('hidden');

  if (summaryEl) {
    // العرض الآمن لبيانات المستخدم باستخدام textContent فقط لمنع أي XSS
    summaryEl.textContent = `${payload.packageName} (${payload.packagePrice} ج.م) — العميل: ${payload.customerName} (${payload.customerPhone}) — ${payload.governorate}، ${payload.detailedAddress}`;
  }

  if (demoBanner) {
    if (isDemo) {
      demoBanner.classList.remove('hidden');
    } else {
      demoBanner.classList.add('hidden');
    }
  }

  // التمرير إلى رسالة النجاح
  successState?.scrollIntoView({ behavior: 'smooth' });
}

function showOrderError(message) {
  const errorContainer = document.getElementById('formGlobalError');
  if (errorContainer) {
    errorContainer.textContent = message;
    errorContainer.classList.remove('hidden');
  }
}

function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorEl = document.getElementById(`${fieldId}Error`);
  if (field) {
    field.classList.add('border-rose-500', 'focus:ring-rose-500');
    field.focus();
  }
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
  }
}

function clearFormErrors() {
  const errorEls = document.querySelectorAll('.field-error-msg');
  errorEls.forEach(el => {
    el.textContent = '';
    el.classList.add('hidden');
  });

  const inputs = document.querySelectorAll('#orderForm input, #orderForm textarea, #orderForm select');
  inputs.forEach(input => {
    input.classList.remove('border-rose-500', 'focus:ring-rose-500');
  });

  const globalError = document.getElementById('formGlobalError');
  if (globalError) {
    globalError.textContent = '';
    globalError.classList.add('hidden');
  }
}

// بدء التطبيق عند تحميل المستند
document.addEventListener('DOMContentLoaded', initApp);
