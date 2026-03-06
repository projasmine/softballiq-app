self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? "New Assignment", {
      body: data.body ?? "You have a new assignment.",
      icon: "/icon-192.png",
      data: { url: data.url ?? "/assignments" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
