import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';

function toggleProject(action) {
  const authPath = path.join(process.env.APPDATA, 'com.vercel.cli', 'Data', 'auth.json');
  if (!fs.existsSync(authPath)) {
    console.error('❌ ملف المصادقة الخاص بـ Vercel غير موجود.');
    process.exit(1);
  }

  const auth = JSON.parse(fs.readFileSync(authPath, 'utf8'));
  const project = JSON.parse(fs.readFileSync(path.join(process.cwd(), '.vercel', 'project.json'), 'utf8'));

  const options = {
    hostname: 'api.vercel.com',
    path: `/v1/projects/${project.projectId}/${action}?teamId=${project.orgId}`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${auth.token}`,
      'Content-Type': 'application/json'
    }
  };

  const req = https.request(options, (res) => {
    let raw = '';
    res.on('data', (chunk) => { raw += chunk; });
    res.on('end', () => {
      if (res.statusCode === 200) {
        if (action === 'pause') {
          console.log('✅ تم إيقاف الموقع بنجاح (DEPLOYMENT_PAUSED). أي زائر يفتح الرابط لن يرى صفحة الهبوط.');
        } else {
          console.log('✅ تم إعادة تفعيل الموقع بنجاح! الموقع يعمل الآن بشكل طبيعي عند فتح الرابط.');
        }
        process.exit(0);
      } else {
        console.error(`❌ خطأ (${res.statusCode}):`, raw);
        process.exit(1);
      }
    });
  });

  req.on('error', (err) => {
    console.error('❌ حدث خطأ في الاتصال:', err.message);
    process.exit(1);
  });

  req.end();
}

const action = process.argv[2] === 'unpause' ? 'unpause' : 'pause';
toggleProject(action);
