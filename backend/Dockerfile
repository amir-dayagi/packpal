# Use a Miniconda (or Mambaforge) base image
FROM continuumio/miniconda3:latest

# Set working directory
WORKDIR /app

# Copy environment file and create the conda environment
COPY environment.yml .

# Create the environment and clean up caches
RUN conda env create -f environment.yml && \
    conda clean -afy

# Make sure conda is available and set the default environment
# We set PATH so the env's python and binaries are used by default.
ENV CONDA_DEFAULT_ENV=packpal-env
ENV PATH=/opt/conda/envs/packpal-env/bin:$PATH

# Copy the rest of the application code
COPY . .

# Expose Flask/Gunicorn port
EXPOSE 5000

# Default command using gunicorn; adjust module:app as needed
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
