# Todo


Deploy Time:
* Edit allowed referers for G. Maps API Key
* Finish New Relic setup
* Integrate with Google Analytics

Normal:
* Migrate TODO to Pivotal Tracker
* Add introduction to site to front view
* Add bottom menu: About, Help, Contact, Terms, copyright, etc
* Remove console logs, breakpoints, etc
* Shim, graceful degradation, etc
* Swap bootstrap w/ custom/other styles
* Enable SSL w/ Nginx
* Mobile layout
* Loading indication -- reset email, login?, picture update, etc.
* Password reset token w/ expiration
* New indexes (username for users, events?)
* Merge resetPassword into /api/users/:id
* Remove id and pass from JSON responses (WIP: POST /api/users/:id)
* Remove uploaded image after processing finished (from /uploads/)
* Correct HTTP status codes
* Proper error return system (incl. 404s, Nginx catch 502, etc)