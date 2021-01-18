# Build: docker build --tag thesis-backend .  
# Run: docker run -p 5000:5000 --name=backend-app -d  thesis-backend

FROM python:3

ADD . /backend
WORKDIR /backend

RUN pip install -r packages.txt

ENV FLASK_APP=backend.py
ENV PYTHONUNBUFFERED=1
ENV FLASK_ENV=development

ENTRYPOINT ["python"]
CMD [ "-m", "flask", "run", "--host", "0.0.0.0"]
