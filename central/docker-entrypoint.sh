#!/bin/bash
set -e

if [ "$CASSANDRA_CONTACT_POINTS" ]; then
  sed -i "s/^cassandra.contactPoints=.*$/cassandra.contactPoints=$CASSANDRA_CONTACT_POINTS/" bullfrog-central.properties
fi
if [ "$CASSANDRA_USERNAME" ]; then
  sed -i "s/^cassandra.username=.*$/cassandra.username=$CASSANDRA_USERNAME/" bullfrog-central.properties
fi
if [ "$CASSANDRA_PASSWORD" ]; then
  sed -i "s/^cassandra.password=.*$/cassandra.password=$CASSANDRA_PASSWORD/" bullfrog-central.properties
fi
if [ "$CASSANDRA_KEYSPACE" ]; then
  sed -i "s/^cassandra.keyspace=.*$/cassandra.keyspace=$CASSANDRA_KEYSPACE/" bullfrog-central.properties
fi
if [ "$CASSANDRA_CONSISTENCY_LEVEL" ]; then
  sed -i "s/^cassandra.consistencyLevel=.*$/cassandra.consistencyLevel=$CASSANDRA_CONSISTENCY_LEVEL/" bullfrog-central.properties
fi
if [ "$CASSANDRA_SYMMETRIC_ENCRYPTION_KEY" ]; then
  sed -i "s/^cassandra.symmetricEncryptionKey=.*$/cassandra.symmetricEncryptionKey=$CASSANDRA_SYMMETRIC_ENCRYPTION_KEY/" bullfrog-central.properties
fi

exec "$@"
