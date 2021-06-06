#---- stage: base ----
FROM node:16.2.0 AS base

WORKDIR /home/node/app

RUN apt-get update \
  && apt-get install -y \
    vim \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

#---- stage: builder ----
FROM base AS builder

WORKDIR /home/node/app

CMD ["/bin/bash", "bin/pkg"]

#---- stage: shell ----
FROM base AS shell

# RUN mkdir -p /root/.c2n
# RUN touch /root/.c2n/credentials
# RUN chmod 600 /root/.c2n/credentials

CMD ["/bin/bash"]