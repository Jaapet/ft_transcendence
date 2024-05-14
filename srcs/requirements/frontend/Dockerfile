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

WORKDIR		/app

RUN			apk add --no-cache libc6-compat

COPY		conf/start.sh ./

EXPOSE		3000

ENTRYPOINT	["sh", "start.sh"]
