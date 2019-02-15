'use strict';

self.addEventListener('push', function(event, a) {
    var notification = event.data.json().notification;
    const title = notification.title;
    const options = {
        body: notification.body,
        icon: '/static/dist/img/logo/icon.png',
        badge: '/static/dist/img/logo/icon.png'
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

//--Añadir opciones a pulsar la notificacion
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('https://diagnosis.yeboyebo.es/')
    );
});