# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: thepaqui <thepaqui@student.42nice.fr>      +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/05/06 17:51:04 by thepaqui          #+#    #+#              #
#    Updated: 2024/05/05 18:32:45 by thepaqui         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

FROM		node:20-alpine

LABEL		author="thepaqui@student.42nice.fr"

RUN			apk add --no-cache libc6-compat

COPY		conf/ /app

WORKDIR		/app

# Used for prerender
#RUN			addgroup --system --gid 1001 nodejs && \
#			adduser --system --uid 1001 nextjs && \
#			mkdir .next && \
#			chown nextjs:nodejs .next
#USER nextjs

RUN			npm install

EXPOSE		3000

ENTRYPOINT	["npm", "run", "dev"]

#ENV PORT 3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
#CMD HOSTNAME="0.0.0.0" node server.js