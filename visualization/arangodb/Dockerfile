# build docker image
# docker build --tag arangodb-thesis .
# start container
# docker run -e ARANGO_ROOT_PASSWORD= -p 8529:8529 arangodb-thesis

FROM arangodb:latest 
WORKDIR .
ENV ARANGO_ROOT_PASSWORD=
# First dump the database to the folder from which you want to restore it
# /Applications/ArangoDB3-CLI.app/Contents/Resources $ ./arangodump --server.database thesis --include-system-collections true --overwrite true --output-directory ~/Documents/src/thesis/src/visualization/arangodb/dump
COPY ./dump /docker-entrypoint-initdb.d/dumps/thesis 
