# Use the official Node.js 18 image as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Create uploads directory and volume
RUN mkdir -p /usr/src/app/uploads

VOLUME /usr/src/app/uploads

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application files to the working directory
COPY . .

# Ensure the .env file is copied (optional: this assumes .env is in the root of the project)
COPY .env .env

# Run `npx prisma generate` to generate Prisma client
RUN npx prisma generate

# Expose the desired port (e.g., 3000)
EXPOSE 3000

# Set the command to run your application with `npm run start`
CMD [ "npm", "run", "start" ]
