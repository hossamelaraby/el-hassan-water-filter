import fs from 'fs';

let html = fs.readFileSync('stitch-mobile.html', 'utf8');

// Replace external Google CDN links with local downloaded assets in /images/
html = html.replace(/https:\/\/lh3\.googleusercontent\.com\/aida\/ALJJyrA323[a-zA-Z0-9_\-]+/g, '/images/hero-mobile.jpg');
html = html.replace(/https:\/\/lh3\.googleusercontent\.com\/aida\/ALJJyrCgIvu[a-zA-Z0-9_\-]+/g, '/images/package-3.jpg');
html = html.replace(/https:\/\/lh3\.googleusercontent\.com\/aida\/ALJJyrAbHLw[a-zA-Z0-9_\-]+/g, '/images/package-5.jpg');
html = html.replace(/https:\/\/lh3\.googleusercontent\.com\/aida\/ALJJyrBfFbI[a-zA-Z0-9_\-]+/g, '/images/package-7.jpg');

// Fix html fixed dimensions so it is fully responsive on all screens
html = html.replace(/style="width:\s*390px;\s*height:\s*9117px;\s*overflow:\s*hidden;\s*position:\s*relative;"/i, '');

// Also ensure container max-width on desktop so it looks gorgeous on mobile AND desktop
html = html.replace('<body class="min-h-screen text-brand-darkText antialiased selection:bg-brand-aqua selection:text-white pb-24 md:pb-8">', '<body class="min-h-screen text-brand-darkText antialiased selection:bg-brand-aqua selection:text-white pb-24 md:pb-8 max-w-xl mx-auto shadow-2xl bg-white border-x border-slate-200">');

// Connect order submission to live /api/order backend
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

const startIdx = html.indexOf(oldFnStart);
const endIdx = html.indexOf(oldFnEnd);

if (startIdx !== -1 && endIdx !== -1) {
  html = html.substring(0, startIdx) + newFn + html.substring(endIdx + oldFnEnd.length);
  fs.writeFileSync('index.html', html, 'utf8');
  console.log('✅ Successfully applied Exact Stitch Mobile Design with local images and live backend!');
} else {
  console.error('❌ Could not find exact function snippet in stitch-mobile.html');
}
