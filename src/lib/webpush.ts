import webpush from "web-push";

if (
  process.env.VAPID_PUBLIC_KEY &&
  process.env.VAPID_PRIVATE_KEY &&
  process.env.VAPID_EMAIL
) {
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export { webpush };

export type PushSubscriptionRow = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

export async function sendPushNotification(
  sub: PushSubscriptionRow,
  payload: { title: string; body: string; url: string }
) {
  return webpush.sendNotification(
    { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
    JSON.stringify(payload)
  );
}
