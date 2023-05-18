# Use an official Node.js runtime as a parent image
FROM node:16.14

# Set the working directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN yarn install

# Bundle app source
COPY . .

# Compile TypeScript into plain JavaScript
RUN yarn build

# Expose port 3000
EXPOSE 3000

# Run the app
CMD [ "node", "--experimental-specifier-resolution=node", "dist/index.js" ]

