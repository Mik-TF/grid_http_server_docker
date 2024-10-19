FROM node:18

RUN git clone https://github.com/threefoldtech/tfgrid-sdk-ts.git
WORKDIR /tfgrid-sdk-ts
RUN yarn install && yarn lerna run build
