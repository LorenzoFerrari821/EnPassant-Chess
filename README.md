Chess application consisting of a desktop part and a mobile part:

Server: Django (enpassant folder) acts as a server for the whole project but serves the desktop part and the mobile part differently. In the first case, it uses its classic MCV model based on authentication and
routing that depends on the browser session, while in the second case the data is served through API (Django Rest Framework), and authentication is performed by sending token to/from the mobile device.
In both cases, there is, as support for WebSocket connections, Django channels (also here session / token authentication between desktop and mobile) for bidirectional communication in some contexts such as sending moves between
players during a game.

- Desktop part: served by Django through templates and classic session-based authentication. On some pages, more dynamic and with more required interactions, I used Django channels to support WebSocket connections and  React for the creation of more complex single-page applications. These single applications (front-end folder) are compiled by babel and packaged by Webpack in static bundles (see scripts and instructions)
 which end up in the static folder and are then served by Django as any static script within the page.

- Mobile part: I used React Native (Expo, to be honest, see "Expo start" to start the application) to build an application of interconnected screens and between which it is possible to navigate while remaining completely inside
of a single application. The various pages interact with the server through specific API and WebSockets connections. The application is authenticated thanks to a token received from the server at the time of login, saved, and presented at each
successive request. Thanks to expo it is possible to test the application on mobile simulators, on your phone, or browser.
