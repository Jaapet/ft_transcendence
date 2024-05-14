# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: thepaqui <thepaqui@student.42nice.fr>      +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/05/05 17:20:04 by thepaqui          #+#    #+#              #
#    Updated: 2024/05/05 18:32:45 by thepaqui         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

FROM		python:3.8-alpine

LABEL		author="thepaqui@student.42nice.fr"

ENV			PIP_DISABLE_PIP_VERSION_CHECK 1

ENV			PYTHONDONTWRITEBYTECODE 1

ENV			PYTHONUNBUFFERED 1

#COPY		conf/backend /usr/app

WORKDIR		/usr/app

RUN			apk add --no-cache \
				build-base \
				libpq-dev && \
			pip install --upgrade \
				pip && \
			pip install --no-cache-dir \
				django \
				djangorestframework \
				django-extensions \
				django-cors-headers \
				psycopg2 \
				pillow

EXPOSE		8000

ENTRYPOINT	["python", "manage.py", "runserver", "0.0.0.0:8000"]
