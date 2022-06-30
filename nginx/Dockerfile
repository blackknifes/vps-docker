FROM alpine:latest
LABEL bknife="a1991815a@gmail.com"

ADD nginx /etc/nginx

RUN apk update && apk add nginx

CMD ["nginx", "-c", "/etc/nginx/nginx.conf"]