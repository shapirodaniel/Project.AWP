# REDFISH / BLUEFISH

a WebRTC video-chat app

# Link to project video demo

https://www.youtube.com/watch?v=usL9n3C3JYI&feature=youtu.be&ab_channel=dasha

# How to pilot

npm install
npm run start-dev

# A note about HTTPS / PeerServer

This project folds PeerServer cloud directly into the backend  
using https, which requires an SSL config. To generate the
necessary files, check out this free walkthrough (tested  
on Mac M1): 

https://www.freecodecamp.org/news/how-to-get-https-working-on-your-local-development-environment-in-5-minutes-7af615770eec/

Rather than set up local https validation, you can use PeerServer's dedicated TURN cloudserver to  
handle user management -- just swap out https-server for app.listen(PORT) in server/index!

# Thanks

This project is built on Fullstack Academy's BOILERMAKER oauth template, relicensed here under MIT.
