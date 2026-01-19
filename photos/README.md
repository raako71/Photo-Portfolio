# React + Vite

- Add new images to sources/images/{album}/
- Run npm run generate-thumbnails
- Run npm run build
- Deploy dist/ folder to nginx

note for nginx config:

    # Cache images for 1 month
    location ~* \.(jpg|jpeg)$ {
       expires 30d;
       add_header Cache-Control "public";
    }

    # SPA routing - serve index.html for all routes
    location / {
       try_files $uri $uri/ /index.html;
    }