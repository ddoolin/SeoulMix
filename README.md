# SeoulMix Setup Readme

## The SeoulMix Project

This project originally started because I wanted to practice Node.js. It evolved into
more of a project for me to encompass and showcase what I believe to be good practices
when writing web application code.

This project is a completely open-source website, from front-to-back. The reason I decided
to make this project open-source is not only for my own benefit (feedback), but also
because I found it very rare to find good, working examples when searching for code samples.
So, with that said, I hope someone can find what they're looking for in 5 minutes rather
than the hours it took me to compile all the knowledge.

As an example, I learned not to commit sensitive data like passwords or API secrets. Now,
hopefully you can be reminded not to do the same by reading this (ha!)

## Task Manager

You can find the public Pivotal Tracker for this project [here](https://www.pivotaltracker.com/projects/824705)

## Installation

As with any Node installation, run "npm install" to install the required packages.
See the Nginx section below to setup Nginx request proxy'ing, though it is possible
to run the server without it (just start the app as usual).

**Note:** Create an app/server/modules/email-settings.js with these details:

	module.exports = {
		host: "smtp.gmail.com",
		user: "email@gmail.com",
		password: "emailpassword",
		sender: "SeoulMix <contact@seoulmix.com>"
	};

**Note #2:** Create an app/server/modules/constants.js with these details
(You will also need to upload app/public/images/default_profile.png to your Cloudinary):

	exports.DEFAULT_PROFILE_IMAGE_ID = "your_default_profile_image_id";

To go along with that, you'll need to set your CLOUDINARY_URL environment variable like so
via a command line interface (you can find the variable on the account details panel):

	$ CLOUDINARY_URL=cloudinary://apikey:apisecret@cloudname
	$ export CLOUDINARY_URL

*Tip:* You can view your enviroment variables using

	$ set

## Organization

File organization is kept pretty simple. Assets in app/public, application code in app/server.
The only piece that may need explanation is the client-side JavaScript. If you're familiar with
Ember.js name scheming, this will be easier for you.

- Views handle user interaction.
- Controllers contain method called by views and relay data to and from the server.
- Form validators validate incoming form data and display errors, notices, etc.

These may overlap from time to time, but this is generally the flow of the app.

## Grunt

SeoulMix uses Grunt to compile, concatenate, and minify client-side JavaScript and CSS.
The Gruntfile is ready to go assuming the directory structure is kept intact. Running
"grunt" will begin the watch process.

If you need to flush the resulting files, simply removing them
and making an empty save is enough to trigger re-compilation.

For development purposes, it may be necessary to change the Uglify beautifier on to make the
resulting JavaScript easier.

## Nginx

SeoulMix uses Nginx to filter incoming requests. Since Nginx's static/asset serving is
second-to-none, we let Nginx handle the asset loading while only the core requests
hit the Node processes.

As an added benefit, Nginx also offers some minimal asset caching and simplifies SSL
when using Node.

The file below is typically located at /etc/nginx/nginx.conf on *nix systems. YMMV.
Be sure to change the directory paths to match your system.

## Nginx configuration file 


	#user html;
	worker_processes  1;

	#error_log  logs/error.log;
	#error_log  logs/error.log  notice;
	#error_log  logs/error.log  info;

	#pid        logs/nginx.pid;


	events {
	    worker_connections  1024;
	}

	user devin users;

	http {
	    # proxy_cache_path  /var/cache/nginx levels=1:2 keys_zone=one:8m max_size=3000m inactive=600m;
	    # proxy_temp_path /var/tmp;
	    include       mime.types;
	    default_type  application/octet-stream;
	    sendfile        on;
	    keepalive_timeout  65;

	    gzip on;
	    gzip_comp_level 6;
	    gzip_vary on;
	    gzip_min_length  1000;
	    gzip_proxied any;
	    gzip_types text/plain text/css application/json application/x-javascript text/xml application/xml application/xml+rss text/javascript;
	    gzip_buffers 16 8k;
	 
	    # ssl_certificate /some/location/sillyfacesociety.com.bundle.crt;
	    # ssl_certificate_key /some/location/sillyfacesociety.com.key;
	    # ssl_protocols        SSLv3 TLSv1;
	    # ssl_ciphers HIGH:!aNULL:!MD5;

	    upstream seoulmix_upstream {
	      server 127.0.0.1:8081;
	      keepalive 64;
	    }

	    server {
	        listen 0.0.0.0:80;
	        # listen 443 ssl;

	        server_name localhost;

	        error_page 502  /errors/502.html;

	    	location ~* ^.+\.(jpg|jpeg|gif|png|ico|css|zip|tgz|gz|rar|bz2|pdf|txt|tar|wav|bmp|rtf|js|flv|swf)$ {
	          root   /home/devin/NodeSites/seoulmix/app/public;
	          access_log off;
	          expires max;
	    	}

	        location /errors {
	          internal;
	          alias /home/devin/NodeSites/seoulmix/app/public/errors;
	        }

	        location / {
	          proxy_redirect off;
	          proxy_set_header   X-Real-IP            $remote_addr;
	          proxy_set_header   X-Forwarded-For  $proxy_add_x_forwarded_for;
	          proxy_set_header   X-Forwarded-Proto $scheme;
	          proxy_set_header   Host                   $http_host;
	          proxy_set_header   X-NginX-Proxy    true;
	          proxy_set_header   Connection "";
	          proxy_http_version 1.1;
	          # proxy_cache one;
	          # proxy_cache_key sfs$request_uri$scheme;
		  proxy_next_upstream error timeout http_502;
	          proxy_pass         http://seoulmix_upstream;
	        }
	    }
	}