import webpush from 'web-push';

const keys = webpush.generateVAPIDKeys();

console.log('Add these to Netlify environment variables:\n');
console.log('VAPID_PUBLIC_KEY=' + keys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + keys.privateKey);
console.log('VITE_VAPID_PUBLIC_KEY=' + keys.publicKey);
console.log('\nAlso create a .env file in the project root with:');
console.log('VITE_VAPID_PUBLIC_KEY=' + keys.publicKey);
