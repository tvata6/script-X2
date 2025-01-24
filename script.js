// قائمة الإيميلات
const emailList = [
    'user1@example.com',
    'user2@example.com',
    'user3@example.com',
    'user4@example.com',
    'user5@example.com'
];

// تعيين إيميل فريد لكل مستخدم
let userEmail = localStorage.getItem('userEmail');

if (!userEmail) {
    userEmail = emailList.shift();  // نأخذ أول إيميل غير مستخدم
    localStorage.setItem('userEmail', userEmail);
}

// جمع بيانات المتصفح
const browserData = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    screenResolution: `${screen.width}x${screen.height}`,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: navigator.deviceMemory,
    plugins: Array.from(navigator.plugins).map(plugin => plugin.name),
    webdriver: navigator.webdriver,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    doNotTrack: navigator.doNotTrack,
    email: userEmail  // استخدام الإيميل الفريد
};

// جمع IP الحقيقي باستخدام WebRTC
const getIP = () => {
    return new Promise((resolve) => {
        const pc = new RTCPeerConnection({ iceServers: [] });
        pc.createDataChannel('');
        pc.createOffer().then(offer => pc.setLocalDescription(offer));
        pc.onicecandidate = (ice) => {
            if (ice.candidate) {
                const ip = ice.candidate.candidate.split(' ')[4];
                resolve(ip);
            }
        };
    });
};

// إرسال البيانات إلى البوت
const sendData = async () => {
    try {
        const ip = await getIP();  // الحصول على IP الحقيقي
        browserData.ip = ip;

        console.log('بيانات المتصفح:', browserData);

        // إرسال البيانات إلى السيرفر المحلي
        const response = await fetch('http://localhost:5000/collect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(browserData)
        });

        if (response.ok) {
            console.log('تم إرسال البيانات بنجاح');
        } else {
            console.error('فشل إرسال البيانات:', response.statusText);
        }
    } catch (error) {
        console.error('حدث خطأ:', error);
    }
};

// إضافة حدث النقر على زر الموافقة
document.getElementById('consentButton').addEventListener('click', sendData);