import fs from 'fs';

let desktopHtml = fs.readFileSync('stitch-desktop.html', 'utf8');

// Replace all image URLs in desktopHtml with the real local PNG assets
desktopHtml = desktopHtml.replace(/src="https:\/\/lh3\.googleusercontent\.com\/aida\/ALJJyrAw0dIB[a-zA-Z0-9_\-]+"/g, 'src="/images/hero-banner.png"');
desktopHtml = desktopHtml.replace(/src="https:\/\/lh3\.googleusercontent\.com\/aida\/ALJJyrCgIvu[a-zA-Z0-9_\-]+"/g, 'src="/images/package-3.png"');
desktopHtml = desktopHtml.replace(/src="https:\/\/lh3\.googleusercontent\.com\/aida\/ALJJyrAbHLw[a-zA-Z0-9_\-]+"/g, 'src="/images/package-5.png"');
desktopHtml = desktopHtml.replace(/src="https:\/\/lh3\.googleusercontent\.com\/aida\/ALJJyrBfFbI[a-zA-Z0-9_\-]+"/g, 'src="/images/package-7.png"');

// Ensure image tags have loading="lazy" for packages and proper styling
desktopHtml = desktopHtml.replace('src="/images/package-3.png"', 'src="/images/package-3.png" loading="lazy"');
desktopHtml = desktopHtml.replace('src="/images/package-5.png"', 'src="/images/package-5.png" loading="lazy"');
desktopHtml = desktopHtml.replace('src="/images/package-7.png"', 'src="/images/package-7.png" loading="lazy"');

// Wire up live Supabase submission to /api/order
const oldFnStart = "function handleOrderSubmit(e) {";
const oldFnEnd = "document.getElementById('successSummary').textContent = `${pkg.name} (${pkg.price}) — العميل: ${name} (${phone}) — ${gov}، ${address}`;\n    }";

const newFn = `async function handleOrderSubmit(e) {
      e.preventDefault();
      const name = document.getElementById('fullName').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const gov = document.getElementById('gov').value;
      const address = document.getElementById('address').value.trim();
      const pkg = packagesData[currentSelected];

      // Egyptian phone validation
      const egyptPhoneRegex = /^01[0125][0-9]{8}$/;
      const cleanPhone = phone.replace(/[\\s\\-\\+]/g, '');
      if (!cleanPhone || !egyptPhoneRegex.test(cleanPhone)) {
        alert('من فضلك اكتب رقم هاتف مصري صحيح (مثال: 01012345678)');
        document.getElementById('phone').focus();
        return;
      }

      const submitBtn = e.target.querySelector('button[type="submit"]');
      const originalHtml = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>جارٍ إرسال الطلب...</span>';
      }

      const currentStages = document.querySelector('input[name="current_filter_stages"]:checked')?.value || 'مش عارف';
      const needInstall = document.querySelector('input[name="need_installation"]:checked')?.value || 'لا';

      const orderPayload = {
        customerName: name,
        customerPhone: cleanPhone,
        governorate: gov,
        detailedAddress: address,
        packageId: currentSelected,
        packageName: pkg.name,
        packagePrice: pkg.price,
        currentFilterStages: currentStages,
        needInstallationService: needInstall
      };

      try {
        const res = await fetch('/api/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload)
        });

        const data = await res.json();
        if (res.ok && data.success) {
          document.getElementById('orderForm').classList.add('hidden');
          const successEl = document.getElementById('successState');
          successEl.classList.remove('hidden');
          document.getElementById('successSummary').textContent = \`\${pkg.name} (\${pkg.price}) — العميل: \${name} (\${cleanPhone}) — \${gov}، \${address}\`;
          successEl.scrollIntoView({ behavior: 'smooth' });
        } else {
          alert(data.error || 'حدث خطأ أثناء إرسال الطلب، يرجى المحاولة لاحقاً');
        }
      } catch (err) {
        alert('تعذر إرسال الطلب، يرجى التحقق من اتصالك بالإنترنت والمحاولة مجدداً');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalHtml;
        }
      }
    }`;

const startIdx = desktopHtml.indexOf(oldFnStart);
const endIdx = desktopHtml.indexOf(oldFnEnd);

if (startIdx !== -1 && endIdx !== -1) {
  desktopHtml = desktopHtml.substring(0, startIdx) + newFn + desktopHtml.substring(endIdx + oldFnEnd.length);
  fs.writeFileSync('index.html', desktopHtml, 'utf8');
  console.log('✅ Generated index.html with FULL Responsive Desktop + Mobile Stitch design and REAL PNG assets!');
} else {
  console.error('❌ Could not locate function block');
}
