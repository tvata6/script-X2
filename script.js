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

// جمع بيانات إضافية من المتصفح
const browserData = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    screenDepth: screen.pixelDepth,
    screenColorDepth: screen.colorDepth,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: navigator.deviceMemory,
    plugins: Array.from(navigator.plugins).map(plugin => plugin.name),
    connectionType: navigator.connection ? navigator.connection.effectiveType : "unknown",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    doNotTrack: navigator.doNotTrack,
    email: userEmail // استخدام الإيميل الفريد
};

// جمع IP باستخدام WebRTC وخدمة خارجية
const getExternalIP = async () => {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Failed to fetch external IP:', error);
        return "unknown";
    }
};

const getIP = async () => {
    const webRTCIP = await new Promise((resolve) => {
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

    const externalIP = await getExternalIP();
    return webRTCIP || externalIP;
};

// إرسال البيانات إلى السيرفر
const sendData = async () => {
    try {
        const ip = await getIP();  // الحصول على IP الحقيقي
        browserData.ip = ip;

        console.log('بيانات المتصفح:', browserData);

        // إرسال البيانات إلى السيرفر
        const response = await fetch('https://cf97-41-105-25-108.ngrok-free.app/collect', {
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

