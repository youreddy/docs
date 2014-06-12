FROM node

ADD . /usr/app
WORKDIR /usr/app

EXPOSE 5050

CMD db="" node app.js
