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

FROM		python:3.8

LABEL		author="thepaqui@student.42nice.fr"

COPY		conf/requirements.txt ./

RUN			pip install --no-cache-dir -r requirements.txt

COPY		conf/ /venv/

WORKDIR		/venv/backend

EXPOSE		8000

#TODO: make a script that can also make db migrations before running the server!
ENTRYPOINT	["python", "manage.py", "runserver", "0.0.0.0:8000"]
