FROM java:openjdk-8

RUN apt-get update

RUN curl -s https://raw.githubusercontent.com/paulp/sbt-extras/master/sbt > /usr/local/bin/sbt
RUN chmod +111 /usr/local/bin/sbt
RUN mkdir -p /tmp/force-init
RUN cd /tmp/force-init
RUN sbt -sbt-create
RUN cd ..
RUN rm -Rf force-init
