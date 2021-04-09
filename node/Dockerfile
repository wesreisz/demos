FROM node:12-stretch
WORKDIR /app
COPY index.js index.js
EXPOSE 3000
RUN chown node: $(pwd)
USER 1000
CMD ["node", "index.js"]
