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

// جمع معلومات WebGL
function getWebGLInfo() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
        return { vendor: 'not supported', renderer: 'not supported', data: 'not supported' };
    }
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    return {
        vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'not supported',
        renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'not supported',
        data: gl.getParameter(gl.VERSION)
    };
}

// جمع تنسيقات الصوت المدعومة
function getAudioFormats() {
    const audio = document.createElement('audio');
    const formats = ['mp3', 'wav', 'ogg', 'aac', 'm4a'];
    const supportedFormats = formats.filter(format => audio.canPlayType(`audio/${format}`) !== '');
    return supportedFormats;
}

// جمع الخطوط المثبتة على الجهاز
function getFonts() {
    const fontList = [];
    const fontCheck = new Set([
        'Arial', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia', 'Comic Sans MS'
    ]);

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    fontCheck.forEach(font => {
        context.font = `72px ${font}`;
        if (context.measureText('mmmmmmmmmlli').width !== context.measureText('MMMMMMMMMMLLI').width) {
            fontList.push(font);
        }
    });

    return fontList;
}

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

// جمع بيانات المتصفح
const browserData = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    deviceMemory: navigator.deviceMemory,
    hardwareConcurrency: navigator.hardwareConcurrency,
    screenResolution: `${screen.width}x${screen.height}`,
    screenAvailableResolution: `${screen.availWidth}x${screen.availHeight}`,
    plugins: Array.from(navigator.plugins).map(plugin => plugin.name),
    webdriver: navigator.webdriver,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    doNotTrack: navigator.doNotTrack,
    email: userEmail,  // استخدام الإيميل الفريد
    webglVendor: getWebGLInfo().vendor,
    webglRenderer: getWebGLInfo().renderer,
    webglData: getWebGLInfo().data,
    audioFormats: getAudioFormats(),
    accelerometer: 'accelerometer' in window,
    keyboardLayout: navigator.keyboard?.getLayoutMap ? 'supported' : 'not supported',
    battery: 'getBattery' in navigator ? 'supported' : 'not supported',
    connection: navigator.connection ? navigator.connection.effectiveType : 'not supported',
    fonts: getFonts(),
    cacheControl: 'cache' in window ? 'supported' : 'not supported'
};

// إرسال البيانات إلى البوت
const sendData = async () => {
    try {
        const ip = await getIP();  // الحصول على IP الحقيقي
        browserData.ip = ip;

        console.log('بيانات المتصفح:', browserData);

        // إرسال البيانات إلى السيرفر المحلي
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
