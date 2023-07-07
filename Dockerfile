FROM node:20

# Install system-level dependencies
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv

# Set the working directory to /app
WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm install

# Install React
RUN npm install -g react-scripts

# Copy app
COPY . .

RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY backend/requirements.txt .
RUN pip install -r requirements.txt

ENV FLASK_APP=/app/backend/app.py

EXPOSE 3000 3001 3002 5000

# Start the React and backend servers
CMD node backend/server.js & node backend/fileStorage.js & python -m flask run --host=0.0.0.0 & npm start

# to run the docker image: `docker run -p 3000:3000 -p 3001:3001 -p 3002:3002 -p 5000:5000 <image name>`
