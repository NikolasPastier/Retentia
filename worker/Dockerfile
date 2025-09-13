FROM public.ecr.aws/lambda/nodejs:18

# Install system dependencies
RUN yum update -y && \
    yum install -y python3 python3-pip ffmpeg && \
    pip3 install yt-dlp

# Copy function code
COPY lambda-youtube-worker.js ${LAMBDA_TASK_ROOT}
COPY package.json ${LAMBDA_TASK_ROOT}

# Install Node.js dependencies
RUN npm install

# Set the CMD to your handler
CMD [ "lambda-youtube-worker.handler" ]
