# Use AWS Lambda Node.js 20 base image
FROM public.ecr.aws/lambda/nodejs:20

# Set working directory inside the container
WORKDIR /var/task

# Copy package.json and package-lock.json first for caching
COPY package*.json ./

# Install dependencies (production only)
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Set the Lambda entrypoint
# Make sure 'index.js' exists and exports 'handler'
CMD ["index.handler"]
