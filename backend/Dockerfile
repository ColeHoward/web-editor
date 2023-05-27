FROM python:3.11

# Create a new user "appuser"
RUN useradd -m appuser

# Switch to the new user
USER appuser

# Set the working directory
WORKDIR /home/appuser

# Set the PATH for the new user
ENV PATH="/home/appuser/.local/bin:${PATH}"

# Set an environment variable needed by Flask
ENV FLASK_APP=app.py

# Copy the current directory contents into the container at /app
COPY --chown=appuser . .

# Install project dependencies
RUN pip install --user -r requirements.txt

EXPOSE 8000

# Run Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "app:app"]
