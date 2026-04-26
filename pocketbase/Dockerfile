FROM alpine:latest

ARG PB_VERSION=0.22.20

RUN apk add --no-cache \
    unzip \
    ca-certificates \
    wget

ADD https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb/

EXPOSE 8080

VOLUME /pb/pb_data

CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8080"]
