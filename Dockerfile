FROM alpine:latest

RUN apk add --no-cache \
    bash \
    coreutils \
    util-linux \
    grep \
    sed \
    gawk \
    findutils \
    diffutils
