# Todo

* Mobile layout
* Loading indication -- reset email, login?, picture update, etc.
* Password reset token w/ expiration
* New indexes (username for users, events?)
* Merge resetPassword into /api/users/:id
* Remove id and pass from JSON responses (WIP: POST /api/users/:id)
* Remove uploaded image after processing finished (from /uploads/)
* Correct HTTP status codes
* Proper error return system (incl. 404s, Nginx catch 502, etc)