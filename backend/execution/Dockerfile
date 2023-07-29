# Dockerfile-frontend for sandboxed environment for user files
FROM python:3.11

# Create a new user "appuser" inside the container
RUN useradd -m appuser

# Switch to the new user
USER appuser

# Set the working directory
WORKDIR /home/appuser

# Set the PATH for the new user
ENV PATH="/home/appuser/.local/bin:${PATH}"

CMD ["tail", "-f", "/dev/null"]
