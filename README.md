# 42_ft_transcendence
Our ft_transcendence project for 42 Nice, started on May 2nd 2024.  
Our group is called ***"Comment devenir millionaire" par Rachid*** and is comprised of **thepaqui**, **bbourret**, **mmidon**, **ggualerz** and **ndesprez**.

## Modules

> 📝 7 major modules are required to validate with a grade of 100%.  
> 📝 9.5 major modules are required to validate with a grade of 125%.  
> 📝 Note that 2 minor modules count for 1 major module.  

As we are not required to complete all modules, here is our definitive selection:
### Major modules
- Back-end in Django
- Standard user management, authentification and tournaments
- Advanced 3D with ThreeJS
- A second game with user history and match-making
- Distant players (playing on 2 different computers)
- Multiple players (more than 2 in one game)
- Log management (ELK)
- 2FA + JSON Web Tokens
---
### Minor modules
- PostgreSQL DB in back-end
- Bootstrap toolkit and Next.js in front-end
- Multiple browser support
- Monitoring system 

## How to use

- `./init.sh all`: Builds and launches the project
- `./init.sh f`: Build and launches the project with containers in foreground
- `./init.sh clean`: Stops the project
- `./init.sh rmcert`: Removes certificates
- `./init.sh fclean`: Stops the project and deletes volumes, images and certificates
- `./init.sh re`: clean + all
- `./init.sh fre`: clean + f
- `./init.sh reset`: fclean + all
- `./init.sh freset`: fclean + f

## Useful links

- [Django + PostgreSQL back-end tutorial](https://www.w3schools.com/django/)
- [Django + Next.js project walkthrough](https://youtube.com/playlist?list=PLPSM8rIid1a0SMqmFOfoHRbyfQ5ipQX79&si=Hx5byuBxDHRUbHmL) <-- INSANELY USEFUL!!!
- [How to Use JWT Authentication with Django REST Framework](https://simpleisbetterthancomplex.com/tutorial/2018/12/19/how-to-use-jwt-authentication-with-django-rest-framework.html)
- [Planning DB](https://app.diagrams.net/)
- [Socket.IO docs](https://socket.io/docs/v3/)
